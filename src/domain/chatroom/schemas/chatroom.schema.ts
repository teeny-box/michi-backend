import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';

@Schema({ timestamps: true })
export class ChatRoom extends AbstractDocument {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String, enum: ChatRoomType })
  type: ChatRoomType;

  @Prop({ type: String })
  ownerId: string;

  @Prop({ type: [String] })
  userIds: Set<string>;

  @Prop({ type: String })
  lastMessageId: string;

  @Prop({ type: String })
  createdAt: Date;

  @Prop({ type: String })
  updatedAt: Date;

  @Prop({ type: String })
  deletedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
