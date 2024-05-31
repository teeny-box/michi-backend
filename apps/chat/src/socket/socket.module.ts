import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UsersModule } from '@auth/users/users.module';
import { RedisCacheModule, RedisConfigService } from '@/common';
import { UsersService } from '@auth/users/users.service';
import { RedisModule } from '@songkeys/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersRepository } from '@auth/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@auth/users/schemas/user.schema';
import { ChatModule } from '../chat.module';
import { ChatroomModule } from '../chatroom/chatroom.module';
import { StatusGateway } from '@chat/socket/status.gateway';
import { NotificationModule } from '@/common/notification/notification.module';

@Module({
  imports: [
    forwardRef(() => ChatroomModule),
    forwardRef(() => ChatModule),
    UsersModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    RedisCacheModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    NotificationModule,
  ],
  providers: [SocketGateway, StatusGateway, UsersService, UsersRepository],
})
export class SocketModule {}
