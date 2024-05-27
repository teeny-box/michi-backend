import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UsersService } from '@auth/users/users.service';
import { ChatService } from '../chat.service';
import { ChatResponseDto } from '../dto/chat-response.dto';
import { CreateChatDto } from '../dto/create-chat.dto';
import { ChatroomService } from '../chatroom/chatroom.service';
import {UserNotFoundException} from "@auth/exceptions/users.exception";
import {ChatroomNotFoundException} from "@chat/exceptions/chatroom.exception";
import {UserResponseDto} from "@auth/users/dto/user-response.dto";
import {InjectQueue} from "@nestjs/bull";
import {Queue} from "bull";

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
export class SocketGateway implements OnModuleInit {
  private readonly logger = new Logger(SocketGateway.name);
  constructor(
    private readonly chatService: ChatService,
    private readonly chatroomService: ChatroomService,
    private readonly userService: UsersService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}
  @WebSocketServer()
  server: Server;

  /**
   * 소켓에 이벤트를 등록합니다.
   * @description
   * - connection: 클라이언트가 소켓에 연결될 때 발생하는 이벤트
   * - join: 클라이언트가 채팅방에 입장할 때 발생하는 이벤트 (join 으로 보내고 onJoin 으로 받음)
   * - leave: 클라이언트가 채팅방에서 퇴장할 때 발생하는 이벤트 (leave 로 보내고 onLeave 로 받음)
   * @returns {void}
   */
  onModuleInit(): void {
    this.server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

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
    });
  }

  private async handleJoin(socket: Socket, data: { chatroomId: string, userId: string }) {
    const { chatroomId, userId } = data;

    const user = await this.userService.findByUserId(userId);
    if (!user) throw new UserNotFoundException("해당 유저를 찾을 수 없습니다");

    const chatroom = await this.chatroomService.findOne(chatroomId);
    if (!chatroom) throw new ChatroomNotFoundException("채팅방을 찾을 수 없습니다");

    socket.data.user = user;
    await this.chatroomService.joinChatRoom(userId, chatroomId);
    socket.join(chatroomId);
    this.server.to(chatroomId).emit('onJoin', {
      message: `${user.nickname}${WELCOME_MESSAGE}`,
      data: new UserResponseDto(user)
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
      const {chatroomId} = payload;
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
      }

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
