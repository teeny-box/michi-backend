import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';

@Schema({ timestamps: true })
export class ChatRoom extends AbstractDocument {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String, enum: ChatRoomType })
  type: ChatRoomType;

  @Prop({ type: [String], default: [] })
  userIds: string[];

  @Prop({ type: String })
  lastMessage: string;

  @Prop({ type: Object, default: {} })
  userUnreadCounts: Record<string, number>;

  @Prop({ type: [String], default: [] })
  joinedUserIds: string[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: Date })
  deletedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);

ChatRoomSchema.index({ updatedAt: -1 });
