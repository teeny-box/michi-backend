import { forwardRef, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat.schema';
import { ChatRepository } from './chat.repository';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { UsersModule } from '@/domain/auth/users/users.module';
import { UsersService } from '@/domain/auth//users/users.service';
import { UsersRepository } from '@/domain/auth/users/users.repository';
import { UserSchema } from '@/domain/auth/users/schemas/user.schema';
import { ChatController } from './chat.controller';
import { DatabaseModule } from '@/database/database.module';
import { RedisCacheModule } from '@/common';
import { ChatRoomSchema } from '@/domain/chatroom/schemas/chatroom.schema';
import { ChatroomModule } from '@/domain/chatroom/chatroom.module';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';
import { ChatroomRepository } from '@/domain/chatroom/chatroom.repository';

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
