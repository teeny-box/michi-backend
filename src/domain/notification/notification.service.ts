import { NotificationRepository } from '@/domain/notification/notification.repository';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Injectable } from '@nestjs/common';
import { UserDeviceService } from '@/domain/device/user-device.service';
import { SendNotificationDto } from '@/domain/notification/dto/send-notification.dto';
import { MulticastMessage } from 'firebase-admin/lib/messaging';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userDeviceService: UserDeviceService,
    @InjectQueue('notification') private notificationQueue: Queue,
    @InjectQueue('global-notification') private globalNotificationQueue: Queue,
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

  async sendNotifications(userIds: string[], payload: SendNotificationDto) {
    const notifications = await this.notificationRepository.createMany(
      userIds.map((userId) => ({
        userId,
        ...payload,
      })),
    );
    const tokens = await this.userDeviceService.getFcmTokensByUserIds(userIds);

    const multicastMessage: MulticastMessage = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      android: {
        priority: payload.priority || 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: payload.contentAvailable || true,
          },
        },
      },
    };

    await this.notificationQueue.add(
      'send-push-notification',
      { multicastMessage },
      {
        removeOnFail: true,
        removeOnComplete: true,
      },
    );

    return notifications;
  }

  async sendGlobalNotification(payload: SendNotificationDto) {
    const notification = await this.notificationRepository.create({
      userId: 'global',
      ...payload,
    });

    await this.globalNotificationQueue.add(
      'send-global-push-notification',
      { notification },
      {
        removeOnFail: true,
        removeOnComplete: true,
      },
    );

    return notification;
  }
}
