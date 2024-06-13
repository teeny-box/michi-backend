import { Module } from '@nestjs/common';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '@/libs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatroomRepository } from './chatroom.repository';
import { SocketModule } from '../socket/socket.module';
import { ChatRoomSchema } from '../schemas/chatroom.schema';

@Module({
  imports: [
    ConfigModule,
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
