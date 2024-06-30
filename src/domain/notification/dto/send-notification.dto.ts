import { PushMessagePriority } from '@/domain/notification/@types/push-message-prirority.type';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

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
    contentAvailable?: boolean,
    priority?: PushMessagePriority,
    data?: Record<string, string>,
  ) {
    this.title = title;
    this.body = body;
    this.contentAvailable = contentAvailable;
    this.priority = priority;
    this.data = data;
  }
}
