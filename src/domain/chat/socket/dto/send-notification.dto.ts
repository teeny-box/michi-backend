import { IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationTypeEnum } from '@/domain/chat/socket/@types/notification-type.enum';

export class SendNotificationDto {
  @IsString()
  title: string;
  @IsString()
  body: string;
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum = NotificationTypeEnum.CHAT; // 알림 타입 (ex. chat, friend, reminder), default: chat

  @IsString()
  @IsOptional()
  url?: string; // 알림 클릭 시 이동할 url

  @IsString()
  @IsOptional()
  imageUrl?: string; // 알림 이미지 url

  @IsString()
  @IsOptional()
  priority?: 'high' | 'normal'; // 알림 우선순위

  data?: Record<string, any>; // 추가 데이터

  constructor(
    title: string,
    body: string,
    type?: NotificationTypeEnum,
    url?: string,
    imageUrl?: string,
    priority?: 'high' | 'normal',
    data?: Record<string, any>,
  ) {
    this.title = title;
    this.body = body;
    this.type = type || NotificationTypeEnum.CHAT;
    this.url = url;
    this.imageUrl = imageUrl;
    this.priority = priority;
    this.data = data;
  }
}
