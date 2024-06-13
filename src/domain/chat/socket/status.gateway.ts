import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UsersService } from '@/domain/auth/users/users.service';
import { RedisCacheService } from '@/libs/common';
import { Status } from '@/libs/common/@types/enums/common.enum';

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
  ) {}

  async handleConnection(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      await this.redisCacheService.setUserOnline(userId as string);
      this.server.emit('userOnline', { userId, status: Status.ONLINE });
      this.logger.log(`Client connected: ${userId}`);
    }
  }

  async handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      await this.redisCacheService.setUserOffline(userId as string);
      this.server.emit('userOffline', { userId, status: Status.OFFLINE });
      this.logger.log(`Client disconnected: ${userId}`);
    }
  }
}
