import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/common';

@Schema()
export class Chat extends AbstractDocument {
  @Prop({ type: String })
  message: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  chatroomId: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
