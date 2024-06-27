import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FirebaseAdminService } from '@/domain/firebase/firebase-admin.service';

@Processor('notification')
export class NotificationProcessor {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  @Process('send-push-notification')
  async sendPushNotification(job: Job) {
    const { tokens, sendNotificationDto } = job.data;
    await this.firebaseAdminService.sendPushNotification(
      tokens,
      sendNotificationDto,
    );
  }
}
