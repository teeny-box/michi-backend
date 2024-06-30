import { NotificationType } from '@/common/enums/notification-type.enum';
import { PushMessagePriority } from '@/domain/notification/@types/push-message-prirority.type';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsEnum(NotificationType)
  type: NotificationType = NotificationType.CHAT_MESSAGE;

  @IsBoolean()
  @IsOptional()
  contentAvailable?: boolean;

  @IsString()
  @IsOptional()
  priority?: PushMessagePriority;

  @IsOptional()
  data?: Record<string, string>;

  constructor(
    title: string,
    body: string,
    type?: NotificationType,
    contentAvailable?: boolean,
    priority?: PushMessagePriority,
    data?: Record<string, string>,
  ) {
    this.title = title;
    this.body = body;
    this.type = type;
    this.contentAvailable = contentAvailable;
    this.priority = priority;
    this.data = data;
  }
}
