import { Injectable } from '@nestjs/common';
import { ChatroomRepository } from './chatroom.repository';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { CreateChatroomDto } from '@/domain/chatroom/dto/create-chatroom.dto';
import { ChatroomNotFoundException } from '@/domain/chatroom/exceptions/chatroom.exception';

@Injectable()
export class ChatroomService {
  constructor(private readonly chatroomRepository: ChatroomRepository) {}

  async findWithDetails(userId: string, pageOptionsDto?: PageOptionsDto) {
    const chatrooms = await this.chatroomRepository.find(
      { userIds: { $in: [userId] } },
      pageOptionsDto,
      { updatedAt: -1 },
    );

    const detailedChatrooms = chatrooms.results.map((chatroom) => ({
      ...chatroom,
      unreadCount:
        (chatroom.userUnreadCounts && chatroom.userUnreadCounts[userId]) || 0,
      isJoined: chatroom.joinedUserIds
        ? chatroom.joinedUserIds.includes(userId)
        : false,
    }));

    return {
      results: detailedChatrooms,
      total: chatrooms.total,
    };
  }

  async findOne(chatroomId: string) {
    return await this.chatroomRepository.findOne({ _id: chatroomId });
  }

  async create(createChatRoomDto: CreateChatroomDto) {
    const userUnreadCounts = createChatRoomDto.userIds.reduce((acc, userId) => {
      acc[userId] = 0;
      return acc;
    }, {});

    return await this.chatroomRepository.create({
      ...createChatRoomDto,
      userUnreadCounts,
      lastMessage: '',
    });
  }

  async softDeleteChatRoom(chatroomId: string) {
    const result = await this.chatroomRepository.findOneAndUpdate(
      { _id: chatroomId },
      { deletedAt: new Date() },
    );

    if (!result) {
      throw new ChatroomNotFoundException(
        `Chatroom with id ${chatroomId} not found`,
      );
    }

    return result;
  }

  async joinChatRoom(userId: string, chatRoomId: string) {
    return await this.chatroomRepository.findOneAndUpdate(
      { _id: chatRoomId },
      {
        $addToSet: { userIds: userId, joinedUserIds: userId }, // $addToSet을 사용하여 중복 방지
        $set: { [`userUnreadCounts.${userId}`]: 0 },
      },
    );
  }

  async leaveChatRoom(userId: string, chatRoomId: string) {
    const chatroom = await this.chatroomRepository.findOneAndUpdate(
      { _id: chatRoomId },
      {
        $pull: { userIds: userId, joinedUserIds: userId },
        $unset: { [`userUnreadCounts.${userId}`]: '' },
      },
    );
    if (chatroom.userIds.length === 0) {
      await this.chatroomRepository.findOneAndUpdate(
        { _id: chatRoomId },
        { deletedAt: new Date() },
      );
    }
  }

  async updateLastMessageAndUnreadCount(
    chatroomId: string,
    message: string,
    senderId: string,
  ) {
    const updateQuery = {
      $set: {
        lastMessage: message,
        updatedAt: new Date(),
      },
      $inc: {},
      $setOnInsert: {
        createdAt: new Date(),
      },
    };

    const chatroom = await this.findOne(chatroomId);
    chatroom.userIds.forEach((participantId) => {
      if (participantId !== senderId) {
        updateQuery.$inc[`userUnreadCounts.${participantId}`] = 1;
      }
    });

    return this.chatroomRepository.findOneAndUpdate(
      { _id: chatroomId },
      updateQuery,
      { new: true, upsert: true },
    );
  }

  async resetUnreadCount(chatroomId: string, userId: string): Promise<void> {
    await this.chatroomRepository.findOneAndUpdate(
      { _id: chatroomId },
      { $set: { [`userUnreadCounts.${userId}`]: 0 } },
      { new: true },
    );
  }

  async getReceivers(chatroomId: string, userId: string) {
    const chatroom = await this.chatroomRepository.findOne({ _id: chatroomId });
    return Array.from(chatroom.userIds).filter((id) => id !== userId);
  }
}
