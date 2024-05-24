import { ChatRoomType } from '../@types/enums/chatroomtype.enum';
import { ChatRoom } from '../schemas/chatroom.schema';
import { Types } from 'mongoose';

export class ChatroomResponseDto {
  readonly id: Types.ObjectId;
  readonly title: string;
  readonly type: ChatRoomType;
  readonly lastMessage: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date | null;

  constructor(chatroom: ChatRoom) {
    this.id = chatroom._id;
    this.title = chatroom.title;
    this.type = chatroom.type;
    this.createdAt = chatroom.createdAt;
    this.updatedAt = chatroom.updatedAt;
    this.deletedAt = chatroom.deletedAt;
  }
}
