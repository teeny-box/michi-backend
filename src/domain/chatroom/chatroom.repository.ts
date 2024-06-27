import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { AbstractRepository } from '@/database/abstract.repository';
import { ChatRoom } from '@/domain/chatroom/schemas/chatroom.schema';

@Injectable()
export class ChatroomRepository extends AbstractRepository<ChatRoom> {
  protected readonly logger = new Logger(ChatroomRepository.name);

  constructor(
    @InjectModel(ChatRoom.name) private readonly chatRoomModel: Model<ChatRoom>,
    @InjectConnection() connection: Connection,
  ) {
    super(chatRoomModel, connection);
  }
}
