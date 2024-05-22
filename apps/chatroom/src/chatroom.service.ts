import { Injectable } from '@nestjs/common';
import {CreateChatroomDto} from "./dto/create-chatroom.dto";
import {ChatroomRepository} from "./chatroom.repository";
import {PageOptionsDto} from "@/common/dto/page/page-options.dto";

@Injectable()
export class ChatroomService {
  constructor(
      private readonly chatroomRepository: ChatroomRepository
  ) {}

  async getChatRooms(pageOptionsDto: PageOptionsDto) {
      return await this.chatroomRepository.find({}, pageOptionsDto);
  }

  async createChatRoom(createChatRoomDto: CreateChatroomDto) {
      return await this.chatroomRepository.create({
        ...createChatRoomDto,
      });
  }

  async joinChatRoom(userId: string, chatRoomId: string) {
    return await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId }, { $push: { userIds: userId } });
  }

  async leaveChatRoom(userId: string, chatRoomId: string) {
    const chatroom = await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId }, { $pull: { userIds: userId } });
    if (chatroom.userIds.length === 0) {
      await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId}, { deletedAt: new Date()});
    }
  }
}
