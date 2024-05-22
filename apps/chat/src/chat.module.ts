import {forwardRef, Module} from '@nestjs/common';
import { ChatService } from './chat.service';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as Joi from 'joi';
import {DatabaseModule, RedisCacheModule, RedisConfigService} from '@/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat.schema';
import {ChatRepository} from "./chat.repository";
import {SocketModule} from "@nestjs/websockets/socket-module";
import {UsersModule} from "../../auth/src/users/users.module";
import {UsersService} from "../../auth/src/users/users.service";
import {UsersRepository} from "../../auth/src/users/users.repository";
import {RedisModule} from "@songkeys/nestjs-redis";
import {UserSchema} from "../../auth/src/users/schemas/user.schema";
import {ChatRoomSchema} from "./schemas/chatroom.schema";
import {ChatroomModule} from "./chatroom/chatroom.module";
import {ChatController} from "./chat.controller";
import {ChatroomService} from "./chatroom/chatroom.service";
import {ChatroomRepository} from "./chatroom/chatroom.repository";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
      }),
      envFilePath: './apps/chat/.env',
    }),
    SocketModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema },
      { name: 'Chatroom', schema: ChatRoomSchema },
      { name: 'User', schema: UserSchema },
    ]),
    UsersModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    RedisCacheModule,
    forwardRef(() => ChatroomModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService, ChatRepository,
    ChatroomService, ChatroomRepository,
    UsersService, UsersRepository,
  ],
  exports: [ChatService],
})
export class ChatModule {}
