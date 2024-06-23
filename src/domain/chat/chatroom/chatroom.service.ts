import { Injectable } from '@nestjs/common';
import { ChatroomRepository } from './chatroom.repository';
import { PageOptionsDto } from '@/libs/common/dto/page/page-options.dto';
import { CreateChatroomDto } from '../dto/create-chatroom.dto';

@Injectable()
export class ChatroomService {
  constructor(private readonly chatroomRepository: ChatroomRepository) {}

  async find(userId?: string, pageOptionsDto?: PageOptionsDto) {
    if (userId) {
      return await this.chatroomRepository.find(
        { userIds: { $in: [userId] } },
        pageOptionsDto,
      );
    }
    return await this.chatroomRepository.find({}, pageOptionsDto);
  }

  async findOne(chatroomId: string) {
    return await this.chatroomRepository.findOne({ _id: chatroomId });
  }

  async create(createChatRoomDto: CreateChatroomDto) {
    return await this.chatroomRepository.create({
      ...createChatRoomDto,
    });
  }

  async joinChatRoom(userId: string, chatRoomId: string) {
    return await this.chatroomRepository.findOneAndUpdate(
      { _id: chatRoomId },
      { $push: { userIds: userId } },
    );
  }

  async leaveChatRoom(userId: string, chatRoomId: string) {
    const chatroom = await this.chatroomRepository.findOneAndUpdate(
      { _id: chatRoomId },
      { $pull: { userIds: userId } },
    );
    if (chatroom.userIds.size === 0) {
      await this.chatroomRepository.findOneAndUpdate(
        { _id: chatRoomId },
        { deletedAt: new Date() },
      );
    }
  }

  async getReceivers(chatroomId: string, userId: string) {
    const chatroom = await this.chatroomRepository.findOne({ _id: chatroomId });
    return Array.from(chatroom.userIds).filter((id) => id !== userId);
  }
}
