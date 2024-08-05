import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { FileType } from '@/common/enums/file-type.enum';

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
    enum: FileType,
    default: FileType.NONE,
  })
  fileType: FileType;

  @Prop({ type: String })
  fileUrl?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ chatroomId: 1, createdAt: 1 });
