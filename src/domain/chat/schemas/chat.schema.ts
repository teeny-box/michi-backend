import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/libs/common';
import { MessageType } from '@/domain/chat/@types/enums/message-type.enum';

@Schema()
export class Chat extends AbstractDocument {
  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  chatroomId: string;

  @Prop({
    type: String,
    enum: MessageType,
    required: true,
  })
  messageType: MessageType;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
