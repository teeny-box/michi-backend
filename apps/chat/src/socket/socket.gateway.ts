import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UsersService } from '@auth/users/users.service';
import { ChatService } from '../chat.service';
import { ChatResponseDto } from '../dto/chat-response.dto';
import { CreateChatDto } from '../dto/create-chat.dto';
import { ChatroomService } from '../chatroom/chatroom.service';
import {UserNotFoundException} from "@auth/exceptions/users.exception";
import {ChatroomNotFoundException} from "@chat/exceptions/chatroom.exception";
import {UserResponseDto} from "@auth/users/dto/user-response.dto";

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
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatroomService))
    private readonly chatroomService: ChatroomService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
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
        const { chatroomId, userId } = data;

        const user = await this.userService.findByUserId(userId);
        if (!user) throw new UserNotFoundException("해당 유저를 찾을 수 없습니다");

        const chatroom = await this.chatroomService.findOne(chatroomId);
        if (!chatroom) throw new ChatroomNotFoundException("채팅방을 찾을 수 없습니다");

        socket.data.user = user;
        await this.chatroomService.joinChatRoom(userId, chatroomId);
        socket.join(chatroomId);
        this.server.to(chatroomId).emit('onJoin', {
          message: `${user.nickname}님이 입장하셨습니다`,
          data: new UserResponseDto(user)
        });
      });

      // 채팅방 퇴장
      socket.on('leave', async (data) => {
        const { chatroomId } = data;
        const userId = socket.data.user.userId;
        await this.chatroomService.leaveChatRoom(userId, chatroomId);
        socket.leave(chatroomId);
        this.server.to(chatroomId).emit('onLeave', {
          message: `${socket.data.user.nickname}님이 퇴장하셨습니다`,
        });
        socket.disconnect(true);
      });
    });
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
    const { chatroomId } = payload;
    const user = client.data.user;
    const chat = await this.chatService.create(payload);
    this.server.to(chatroomId).emit('onMessage', {
      message: '메시지 전송에 성공하였습니다',
      data: new ChatResponseDto(chat, user),
    });
  }
}
