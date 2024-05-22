import {ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer} from "@nestjs/websockets";
import {forwardRef, Inject, Logger, OnModuleInit} from "@nestjs/common";
import {ChatService} from "../../../chat/src/chat.service";
import {ChatroomService} from "../chatroom.service";
import {Server, Socket} from "socket.io";
import {CreateChatDto} from "../../../chat/src/dto/create-chat.dto";

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
  ) {}
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      this.logger.log(`Client connected: ${socket.id}`);

      // 채팅방 입장
      socket.on('join', async (data) => {
        const {chatroomId, userId} = data;
        await this.chatroomService.joinChatRoom(userId, chatroomId);
        socket.join(chatroomId);
        this.server.to(chatroomId).emit('join', {chatroomId, userId});
      });

      // 채팅방 퇴장
      socket.on('leave', async (data) => {
        const {chatroomId, userId} = data;
        await this.chatroomService.leaveChatRoom(userId, chatroomId);
        socket.leave(chatroomId);
        this.server.to(chatroomId).emit('leave', {chatroomId, userId});
        socket.disconnect(true);
      });
    });
  }

  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: CreateChatDto) {
    const {message, userId, chatroomId} = payload;
    const chat = await this.chatService.create(payload);
    this.server.to(chatroomId).emit('onMessage', {
      msg: 'New Message',
      content: chat
    });
  }
}