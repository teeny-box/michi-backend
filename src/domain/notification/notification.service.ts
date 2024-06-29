import { NotificationRepository } from '@/domain/notification/notification.repository';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationPayload } from '@/domain/notification/schemas/notification-payload.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto, userId: string) {
    return await this.notificationRepository.find({ userId }, pageOptionsDto);
  }

  async getUnreadCount(user: User) {
    return await this.notificationRepository.countByUserIdAndCreatedAtAfter(
      user.userId,
      user.notificationCheckedAt,
    );
  }

  async sendNotification(userId: string, payload: NotificationPayload) {
    const notification = await this.notificationRepository.create({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      contentAvailable: payload.contentAvailable,
      priority: payload.priority,
      deepLink: payload.deepLink,
      data: payload.data,
    });

    await this.notificationQueue.add('send-push-notification', {
      userId,
      payload,
    });

    return notification;
  }

  async sendNotifications(userIds: string[], payload: NotificationPayload) {
    const notifications = await this.notificationRepository.createMany(
      userIds.map((userId) => ({
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        contentAvailable: payload.contentAvailable,
        priority: payload.priority,
        deepLink: payload.deepLink,
        data: payload.data,
      })),
    );

    await this.notificationQueue.add('send-push-notifications', {
      userIds,
      payload,
    });

    return notifications;
  }
}
