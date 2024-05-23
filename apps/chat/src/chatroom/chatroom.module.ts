import { Module } from '@nestjs/common';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '@/common';
import { ConfigModule } from '@nestjs/config';
import { ChatroomRepository } from './chatroom.repository';
import * as Joi from 'joi';
import { SocketModule } from '../socket/socket.module';
import { ChatRoomSchema } from '../schemas/chatroom.schema';

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
    MongooseModule.forFeature([{ name: 'ChatRoom', schema: ChatRoomSchema }]),
    DatabaseModule,
  ],
  controllers: [ChatroomController],
  providers: [ChatroomService, ChatroomRepository],
  exports: [
    ChatroomService,
    ChatroomRepository,
    MongooseModule.forFeature([{ name: 'Chatroom', schema: ChatRoomSchema }]),
  ],
})
export class ChatroomModule {}
