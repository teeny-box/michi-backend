import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/common';

@Schema()
export class Message extends AbstractDocument {
  @Prop({ type: String })
  text: string;

  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  chatId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
