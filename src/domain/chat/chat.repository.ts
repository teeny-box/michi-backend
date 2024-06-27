import { Injectable, Logger } from '@nestjs/common';
import { Chat } from './schemas/chat.schema';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { AbstractRepository } from '@/database/abstract.repository';

@Injectable()
export class ChatRepository extends AbstractRepository<Chat> {
  protected readonly logger = new Logger(ChatRepository.name);

  constructor(
    @InjectModel(Chat.name) private readonly chatModel: Model<Chat>,
    @InjectConnection() connection: Connection,
  ) {
    super(chatModel, connection);
  }
}
