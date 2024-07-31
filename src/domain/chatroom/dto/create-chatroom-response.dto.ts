import { Types } from 'mongoose';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';
import { ChatRoom } from '@/domain/chatroom/schemas/chatroom.schema';

export class CreateChatroomResponseDto {
  readonly id: Types.ObjectId;
  readonly title: string;
  readonly type: ChatRoomType;
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
