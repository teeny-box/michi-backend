import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { NotificationType } from '@/common/enums/notification-type.enum';
import { PushMessagePriority } from '@/domain/notification/@types/push-message-prirority.type';

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

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ type: Boolean, default: true, required: false })
  contentAvailable?: boolean;

  priority?: PushMessagePriority;

  @Prop({ type: String, default: null, required: false })
  deepLink?: string;

  @Prop({ type: Object, default: null, required: false })
  data?: Record<string, string>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export { NotificationSchema };
