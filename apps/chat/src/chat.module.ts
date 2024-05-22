import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseModule } from '@/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from './schemas/chat.schema';
import {ChatRepository} from "./chat.repository";
import {SocketModule} from "@nestjs/websockets/socket-module";

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
    MongooseModule.forFeature([{ name: 'Chat', schema: ChatSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatRepository],
  exports: [ChatService],
})
export class ChatModule {}
