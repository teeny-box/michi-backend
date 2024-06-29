import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FirebaseAdminService } from '@/domain/firebase/firebase-admin.service';
import { UserDeviceService } from '@/domain/device/user-device.service';

@Processor('notification')
export class NotificationProcessor {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly userDeviceService: UserDeviceService,
  ) {}

  @Process('send-push-notification')
  async sendPushNotification(job: Job) {
    const { userId, payload } = job.data;
    const tokens = await this.userDeviceService.getFcmTokensByUserId(userId);
    await this.firebaseAdminService.sendPushNotification(tokens, payload);
  }

  @Process('send-push-notifications')
  async sendPushNotifications(job: Job) {
    const { userIds, payload } = job.data;
    const tokens = await this.userDeviceService.getFcmTokensByUserIds(userIds);
    await this.firebaseAdminService.sendPushNotification(tokens, payload);
  }
}
