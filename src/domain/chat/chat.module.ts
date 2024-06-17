import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule, RedisCacheModule } from '@/libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat.schema';
import { ChatRepository } from './chat.repository';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { UsersModule } from '@/domain/auth/users/users.module';
import { UsersService } from '@/domain/auth//users/users.service';
import { UsersRepository } from '@/domain/auth/users/users.repository';
import { UserSchema } from '@/domain/auth/users/schemas/user.schema';
import { ChatRoomSchema } from './schemas/chatroom.schema';
import { ChatroomModule } from './chatroom/chatroom.module';
import { ChatController } from './chat.controller';
import { ChatroomService } from './chatroom/chatroom.service';
import { ChatroomRepository } from './chatroom/chatroom.repository';

@Module({
  imports: [
    ConfigModule,
    SocketModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'Chat', schema: ChatSchema },
      { name: 'Chatroom', schema: ChatRoomSchema },
      { name: 'User', schema: UserSchema },
    ]),
    UsersModule,
    RedisCacheModule,
    forwardRef(() => ChatroomModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatRepository,
    ChatroomService,
    ChatroomRepository,
    UsersService,
    UsersRepository,
  ],
  exports: [ChatService],
})
export class ChatModule {}
