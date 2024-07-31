import { ChatRoom } from '@/domain/chatroom/schemas/chatroom.schema';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';
import { Types } from 'mongoose';

export const chatroomMock: ChatRoom = {
  _id: new Types.ObjectId('664e1bdc14426cbe69b15ce9'),
  title: 'Mock Chat Room',
  type: ChatRoomType.PRIVATE,
  userIds: ['testUser', 'userId2'],
  lastMessage: '',
  userUnreadCounts: {},
  joinedUserIds: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
