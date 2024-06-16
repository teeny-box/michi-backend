import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UsersService } from '@/domain/auth/users/users.service';
import { RedisCacheService } from '@/libs/common';
import { Status } from '@/libs/common/@types/enums/common.enum';
import { ChatroomService } from '@/domain/chat/chatroom/chatroom.service';
import { CreateChatroomDto } from '@/domain/chat/dto/create-chatroom.dto';
import { ChatRoomType } from '@/domain/chat/@types/enums/chatroomtype.enum';

type ChatResponse = {
  sender: string;
  receiver: string;
  response: 'accept' | 'reject';
};

@WebSocketGateway({
  namespace: '/socket/status',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class StatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(StatusGateway.name);

  constructor(
    private readonly userService: UsersService,
    private readonly redisCacheService: RedisCacheService,
    private readonly chatroomService: ChatroomService,
  ) {}

  async handleConnection(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      await this.redisCacheService.setUserOnline(userId as string);
      await this.redisCacheService.addUserToChatQueue(userId as string);
      this.server.emit('userOnline', { userId, status: Status.ONLINE });
      this.logger.log(`Client connected: ${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      await this.redisCacheService.setUserOffline(userId as string);
      await this.redisCacheService.removeUserFromChatQueue(userId as string);
      this.server.emit('userOffline', { userId, status: Status.OFFLINE });
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }

  @SubscribeMessage('chatResponse')
  async handleChatResponse(client: Socket, payload: ChatResponse) {
    if (payload.response === 'accept') {
      // 채팅방 생성
      await this.chatroomService.create(
        new CreateChatroomDto(
          `${payload.sender}'s room`,
          ChatRoomType.PRIVATE,
          payload.sender,
        ),
      );

      // 채팅 큐에서 제거
      await this.redisCacheService.removeUserFromChatQueue(payload.sender);
      await this.redisCacheService.removeUserFromChatQueue(payload.receiver);

      // 소켓 이벤트 발송
      this.server
        .to(payload.sender)
        .emit('chatAccepted', { userId: payload.receiver });
    } else {
      // 거절 처리
      this.server
        .to(payload.sender)
        .emit('chatRejected', { userId: payload.receiver });
    }
  }

  sendChatRequest(sender: string, receiver: string) {
    this.server.to(sender).emit('chatRequest', { receiver });
  }
}
