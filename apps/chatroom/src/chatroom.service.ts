import { Injectable } from '@nestjs/common';
import {CreateChatroomDto} from "./dto/create-chatroom.dto";
import {ChatroomRepository} from "./chatroom.repository";
import {User} from "../../auth/src/users/schemas/user.schema";
import {PageOptionsDto} from "@/common/dto/page/page-options.dto";

@Injectable()
export class ChatroomService {
  constructor(
      private readonly chatroomRepository: ChatroomRepository
  ) {}

  async getChatRooms(pageOptionsDto: PageOptionsDto) {
      return await this.chatroomRepository.find({}, pageOptionsDto);
  }

  async createChatRoom(user: User, createChatRoomDto: CreateChatroomDto) {
      return await this.chatroomRepository.create({
        ...createChatRoomDto
      });
  }

  async joinChatRoom(user: User, chatRoomId: string) {
    return await this.chatroomRepository.findOneAndUpdate({ _id: chatRoomId }, { $push: { userIds: user.userId } });
  }
}
