import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { NotificationTypeEnum } from '@/common/enums/notification-type.enum';

type PriorityType = 'high' | 'normal';

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

  @IsBoolean()
  @IsOptional()
  contentAvailable?: boolean; // 알림 콘텐츠가 존재하는지 여부

  @IsString()
  @IsOptional()
  priority?: PriorityType; // 알림 우선순위

  data?: Record<string, any>; // 추가 데이터

  constructor(
    title: string,
    body: string,
    type?: NotificationTypeEnum,
    url?: string,
    imageUrl?: string,
    contentAvailable?: boolean,
    priority?: PriorityType,
    data?: Record<string, any>,
  ) {
    this.title = title;
    this.body = body;
    this.type = type || NotificationTypeEnum.CHAT;
    this.url = url;
    this.imageUrl = imageUrl;
    this.contentAvailable = contentAvailable;
    this.priority = priority;
    this.data = data;
  }
}
