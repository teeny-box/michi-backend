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
import { UserNotFoundException } from '@/domain/auth/exceptions/users.exception';
import { ChatroomNotFoundException } from '@/domain/chat/exceptions/chatroom.exception';
import { UserResponseDto } from '@/domain/auth/users/dto/user-response.dto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisCacheService } from '@/libs/common';
import { UsersService } from '@/domain/auth/users/users.service';
import { ChatService } from '@/domain/chat/chat.service';
import { ChatroomService } from '@/domain/chat/chatroom/chatroom.service';
import { CreateChatDto } from '@/domain/chat/dto/create-chat.dto';
import { ChatResponseDto } from '@/domain/chat/dto/chat-response.dto';

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
  constructor(
    private readonly chatService: ChatService,
    private readonly chatroomService: ChatroomService,
    private readonly userService: UsersService,
    private readonly redisCacheService: RedisCacheService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}
  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() socket: Socket) {
    const { userId } = socket.handshake.query;
    this.logger.log(
      `Client connected: socket id - ${socket.id}, userId - ${userId}`,
    );

    // 온라인인 유저 집합에 추가
    await this.redisCacheService.setUserOnline(userId as string);

    // 랜덤 채팅 큐에 유저 추가
    if (await this.redisCacheService.isUserInChatQueue(userId as string)) {
      await this.redisCacheService.addUserToChatQueue(userId as string);
    }

    // 채팅방 입장
    socket.on('join', async (data) => {
      try {
        await this.handleJoin(socket, data);
      } catch (error) {
        this.logger.error(`Join error: ${error.message}`, error.stack);
      }
    });

    // 채팅방 퇴장
    socket.on('leave', async (data) => {
      try {
        await this.handleLeave(socket, data);
      } catch (error) {
        this.logger.error(`Leave error: ${error.message}`, error.stack);
      }
    });
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const { userId } = socket.handshake.query;
    this.logger.log(
      `Client disconnected: socket id - ${socket.id}, userId - ${userId}`,
    );

    await this.redisCacheService.setUserOffline(userId as string);
    await this.redisCacheService.removeUserFromChatQueue(userId as string);
  }

  private async handleJoin(
    socket: Socket,
    data: { chatroomId: string; userId: string },
  ) {
    const { chatroomId, userId } = data;

    const user = await this.userService.findByUserId(userId);
    if (!user) throw new UserNotFoundException('해당 유저를 찾을 수 없습니다');

    const chatroom = await this.chatroomService.findOne(chatroomId);
    if (!chatroom)
      throw new ChatroomNotFoundException('채팅방을 찾을 수 없습니다');

    socket.data.user = user;
    await this.chatroomService.joinChatRoom(userId, chatroomId);
    socket.join(chatroomId);
    this.server.to(chatroomId).emit('onJoin', {
      message: `${user.nickname}${WELCOME_MESSAGE}`,
      data: new UserResponseDto(user),
    });
  }

  private async handleLeave(socket: Socket, data: { chatroomId: string }) {
    const { chatroomId } = data;
    const userId = socket.data.user.userId;

    await this.chatroomService.leaveChatRoom(userId, chatroomId);
    socket.leave(chatroomId);
    this.server.to(chatroomId).emit('onLeave', {
      message: `${socket.data.user.nickname}${GOODBYE_MESSAGE}`,
    });
    socket.disconnect(true);
  }

  /**
   * message 로 보내면, onMessage 로 받음
   */
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateChatDto,
  ) {
    this.logger.log(`client id: ${client.id}`);

    try {
      const { chatroomId } = payload;
      const user = client.data.user;
      const chat = await this.chatService.create(payload);

      // Broadcast to all clients in the chatroom
      this.server.to(chatroomId).emit('onMessage', {
        message: MESSAGE_SUCCESS,
        data: new ChatResponseDto(chat, user),
      });

      // Push Notification
      const notificationData = {
        token: user.fcmToken,
        title: NEW_MESSAGE_TITLE,
        body: `${user.nickname} : ${chat.message}`,
      };

      // Add job to queue
      await this.notificationQueue.add(notificationData);
    } catch (error) {
      this.logger.error(`Message error: ${error.message}`, error.stack);
      client.emit('onError', {
        message: error.message,
      });
    }
  }
}
