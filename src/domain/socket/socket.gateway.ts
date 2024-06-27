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
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
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
import { SendNotificationDto } from '@/domain/notification/dto/send-notification.dto';
import { UserNotFoundException } from '@/domain/auth/exceptions/users.exception';

const WELCOME_MESSAGE = '님이 입장하셨습니다';
const GOODBYE_MESSAGE = '님이 퇴장하셨습니다';
const MESSAGE_SUCCESS = '메시지 전송에 성공하였습니다';
const NEW_MESSAGE_TITLE = '새로운 메시지가 도착했습니다';

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
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const token = socket.handshake.headers.authorization;
    if (!token || token.length === 0)
      throw new NoTokenProvidedException('토큰이 제공되지 않았습니다');

    const user = await this.authService.getUserByToken(token);
    if (!user) throw new UserNotFoundException('사용자를 찾을 수 없습니다');
    socket.data.userId = user.userId;

    this.logger.log(
      `Client connected: socket id - ${socket.id}, userId - ${user.userId}`,
    );

    await this.handleUserConnection(user.userId);

    this.setupSocketListeners(socket);
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { userId } = socket.handshake.query as { userId: string };
    this.logger.log(
      `Client disconnected: socket id - ${socket.id}, userId - ${userId}`,
    );

    await this.handleUserDisconnection(userId);
  }

  private async handleUserConnection(userId: string) {
    await this.redisCacheService.setUserOnline(userId);
    if (await this.redisCacheService.isUserInChatQueue(userId)) {
      await this.redisCacheService.addUserToChatQueue(userId);
    }
  }

  private async handleUserDisconnection(userId: string) {
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
        message: `${user.nickname}${WELCOME_MESSAGE}`,
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
      message: `${user.nickname}${GOODBYE_MESSAGE}`,
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
    const sender = await this.userService.findByUserId(userId);
    const chat = await this.chatService.create({
      ...payload,
      userId,
    } as CreateChatDto);

    const chatResponse = new ChatResponseDto(chat, sender);
    this.server.to(payload.chatroomId).emit('onMessage', {
      message: MESSAGE_SUCCESS,
      data: chatResponse,
    });

    return chatResponse;
  }

  private async sendPushNotifications(
    userId: string,
    chatroomId: string,
    chat: ChatResponseDto,
  ) {
    const receivers = await this.chatroomService.getReceivers(
      chatroomId,
      userId,
    );
    const tokens = await this.userService.getFcmTokensByUserIds(receivers);

    const notificationData = {
      tokens: tokens,
      sendNotificationDto: new SendNotificationDto(
        NEW_MESSAGE_TITLE,
        chat.message,
      ),
    };

    await this.notificationQueue.add(
      `send-push-notification`,
      notificationData,
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  private handleError(socket: Socket, context: string, error: Error) {
    this.logger.error(`${context} error: ${error.message}`, error.stack);
    socket.emit('onError', {
      message: error.message,
    });
  }
}
