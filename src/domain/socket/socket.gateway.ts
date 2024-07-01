import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserResponseDto } from '@/domain/auth/users/dto/user-response.dto';
import { UsersService } from '@/domain/auth/users/users.service';
import { ChatService } from '@/domain/chat/chat.service';
import { CreateChatDto } from '@/domain/chat/dto/create-chat.dto';
import { ChatResponseDto } from '@/domain/chat/dto/chat-response.dto';
import { AuthService } from '@/domain/auth/auth.service';
import { NoTokenProvidedException } from '@/domain/auth/exceptions/auth.exception';
import { RedisCacheService } from '@/common';
import { JoinChatroomDto } from '@/domain/socket/dto/join-chatroom.dto';
import { LeaveChatroomDto } from '@/domain/socket/dto/leave-chatroom.dto';
import { SendMessageDto } from '@/domain/socket/dto/send-message.dto';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';
import { ChatroomNotFoundException } from '@/domain/chatroom/exceptions/chatroom.exception';
import { UserNotFoundException } from '@/domain/auth/exceptions/users.exception';
import { NotificationService } from '@/domain/notification/notification.service';
import { SendNotificationDto } from '@/domain/notification/dto/send-notification.dto';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { SOCKET_MESSAGES } from '@/domain/socket/data/socket.constants';

@WebSocketGateway({
  namespace: '/socket/chat',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatroomService: ChatroomService,
    private readonly userService: UsersService,
    private readonly redisCacheService: RedisCacheService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const user = await this.authenticateUser(socket);
      await this.handleUserConnection(user.userId);
      this.setupSocketListeners(socket);
      this.logger.log(
        `Client connected: socket id - ${socket.id}, userId - ${user.userId}`,
      );
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      socket.emit('onError', {
        message: error.message,
      });
      await this.handleSocketDisconnectionOnly(socket);
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { userId } = socket.handshake.query as { userId: string };
    this.logger.log(
      `Client disconnected: socket id - ${socket.id}, userId - ${userId}`,
    );

    await this.handleUserDisconnection(socket, userId);
  }

  private async handleUserConnection(userId: string) {
    await Promise.all([
      this.redisCacheService.setUserOnline(userId),
      this.redisCacheService.isUserInChatQueue(userId) &&
        this.redisCacheService.addUserToChatQueue(userId),
    ]);
  }

  private async authenticateUser(socket: Socket) {
    const token = socket.handshake.headers.authorization;
    if (!token || token.length === 0)
      throw new NoTokenProvidedException('토큰이 제공되지 않았습니다');

    const user = await this.authService.getUserByToken(token);
    if (!user) throw new UserNotFoundException('사용자를 찾을 수 없습니다');

    socket.data.userId = user.userId;
    return user;
  }

  private async handleSocketDisconnectionOnly(
    @ConnectedSocket() socket: Socket,
  ) {
    socket.disconnect(true);
  }

  private async handleUserDisconnection(
    @ConnectedSocket() socket: Socket,
    userId: string,
  ) {
    socket.disconnect(true);
    await this.redisCacheService.setUserOffline(userId);
    await this.redisCacheService.removeUserFromChatQueue(userId);
  }

  private setupSocketListeners(socket: Socket) {
    socket.on('join', (data) => this.handleJoin(socket, data));
    socket.on('leave', (data) => this.handleLeave(socket, data));
  }

  private async handleJoin(
    @ConnectedSocket() client: Socket,
    data: JoinChatroomDto,
  ) {
    try {
      const { chatroomId } = data;
      const userId = client.data.userId;

      const user = await this.userService.findByUserId(userId);
      const chatroom = await this.chatroomService.findOne(chatroomId);

      if (!chatroom)
        throw new ChatroomNotFoundException('채팅방을 찾을 수 없습니다');

      await this.chatroomService.joinChatRoom(userId, chatroomId);
      this.server.in(client.id).socketsJoin(chatroomId);

      this.server.to(chatroomId).emit('onJoin', {
        message: `${user.nickname}${SOCKET_MESSAGES.WELCOME}`,
        data: new UserResponseDto(user),
      });
    } catch (error) {
      this.logger.error(`Join error: ${error.message}`, error.stack);
      client.emit('onError', {
        message: error.message,
      });
    }
  }

  private async handleLeave(
    @ConnectedSocket() client: Socket,
    data: LeaveChatroomDto,
  ) {
    const { chatroomId } = data;
    const userId = client.data.userId;

    const user = await this.userService.findByUserId(userId);
    await this.chatroomService.leaveChatRoom(userId, chatroomId);
    this.server.in(client.id).socketsLeave(chatroomId);

    this.server.to(chatroomId).emit('onLeave', {
      message: `${user.nickname}${SOCKET_MESSAGES.GOODBYE}`,
    });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    try {
      const userId = client.data.userId;
      const chat = await this.createAndBroadcastMessage(userId, payload);
      await this.sendPushNotifications(userId, payload.chatroomId, chat);
    } catch (error) {
      this.handleError(client, 'Message error', error);
    }
  }

  private async createAndBroadcastMessage(
    userId: string,
    payload: SendMessageDto,
  ) {
    const [sender, chat] = await Promise.all([
      this.userService.findByUserId(userId),
      this.chatService.create({ ...payload, userId } as CreateChatDto),
    ]);

    const chatResponse = new ChatResponseDto(chat, sender);
    this.server.to(payload.chatroomId).emit('onMessage', {
      message: SOCKET_MESSAGES.MESSAGE_SUCCESS,
      data: chatResponse,
    });

    return chatResponse;
  }

  private async sendPushNotifications(
    userId: string,
    chatroomId: string,
    chat: ChatResponseDto,
  ) {
    const receiverIds = await this.chatroomService.getReceivers(
      chatroomId,
      userId,
    );

    const sendNotificationDto = new SendNotificationDto(
      SOCKET_MESSAGES.NEW_MESSAGE_TITLE,
      chat.message,
      true,
      'high',
      { chatroomId },
    );

    await this.notificationService.sendNotifications(
      receiverIds,
      sendNotificationDto,
    );
  }

  private handleError(socket: Socket, context: string, error: Error) {
    this.logger.error(`${context} error: ${error.message}`, error.stack);
    socket.emit('onError', {
      message: error.message,
    });
  }
}
