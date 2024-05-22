import { Injectable } from '@nestjs/common';
import {ChatroomRepository} from "./chatroom.repository";
import {PageOptionsDto} from "@/common/dto/page/page-options.dto";
import {CreateChatroomDto} from "../dto/create-chatroom.dto";

@Injectable()
export class ChatroomService {
  constructor(
      private readonly chatroomRepository: ChatroomRepository
  ) {}

  async find(pageOptionsDto: PageOptionsDto) {
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
    return await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId }, { $push: { userIds: userId } });
  }

  async leaveChatRoom(userId: string, chatRoomId: string) {
    const chatroom = await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId }, { $pull: { userIds: userId } });
    console.log(chatroom);
    // if (chatroom.userIds.length === 0) {
    //   await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId}, { deletedAt: new Date()});
    // }
  }
}