import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/libs/common';
import { MessageType } from '@/domain/chat/@types/enums/message-type.enum';

@Schema({ timestamps: true })
export class Chat extends AbstractDocument {
  @Prop({ type: String })
  message: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  chatroomId: string;

  @Prop({ type: String })
  messageType: MessageType;

  @Prop({ type: Date })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
