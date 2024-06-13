import { Injectable } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { CreateChatDto } from './dto/create-chat.dto';
import { PageOptionsDto } from '@/libs/common/dto/page/page-options.dto';
import { ChatroomService } from './chatroom/chatroom.service';
import { ChatroomNotFoundException } from './exceptions/chatroom.exception';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatroomService: ChatroomService,
    private readonly chatRepository: ChatRepository,
  ) {}

  async find(chatroomId: string, pageOptionsDto?: PageOptionsDto) {
    const chatroom = await this.chatroomService.findOne(chatroomId);
    if (!chatroom) {
      throw new ChatroomNotFoundException('채팅방이 존재하지 않습니다.');
    }
    return await this.chatRepository.find({ chatroomId }, pageOptionsDto);
  }

  async create(createChatDto: CreateChatDto) {
    return await this.chatRepository.create(createChatDto);
  }
}
