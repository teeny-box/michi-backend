import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { NotificationTypeEnum } from '@/common/enums/notification-type.enum';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Notification extends AbstractDocument {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, enum: NotificationTypeEnum, required: true })
  type: NotificationTypeEnum;

  @Prop({ type: String, default: null, required: false })
  deepLink?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export { NotificationSchema };
