import { Injectable } from '@nestjs/common';
import {ChatRepository} from "./chat.repository";
import {CreateChatDto} from "./dto/create-chat.dto";

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository
  ) {}

  async create(createChatDto: CreateChatDto) {
    return await this.chatRepository.create(createChatDto);
  }
}
