import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UsersModule } from '../../../auth/src/users/users.module';
import { RedisCacheModule, RedisConfigService } from '@/common';
import { UsersService } from '../../../auth/src/users/users.service';
import { RedisModule } from '@songkeys/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersRepository } from '../../../auth/src/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../../../auth/src/users/schemas/user.schema';
import { ChatModule } from '../chat.module';
import { ChatroomModule } from '../chatroom/chatroom.module';
import {StatusGateway} from "@chat/socket/status.gateway";

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
  ],
  providers: [SocketGateway, StatusGateway, UsersService, UsersRepository],
})
export class SocketModule {}
