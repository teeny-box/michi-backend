import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';

@Processor('global-notification')
export class GlobalNotificationProcessor {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  @Process('send-global-push-notification')
  async sendGlobalPushNotification(job: Job) {
    const { notification } = job.data;
    await this.firebaseAdminService.sendGlobalPushNotification(
      notification.title,
      notification.message,
      notification.data,
    );
  }
}
