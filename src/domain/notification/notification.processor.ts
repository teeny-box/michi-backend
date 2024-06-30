import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { FirebaseAdminService } from '@/domain/firebase/firebase-admin.service';
import { MulticastMessage } from 'firebase-admin/lib/messaging';

@Processor('notification')
export class NotificationProcessor {
  constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

  @Process('send-push-notification')
  async sendPushNotification(job: Job<{ multicastMessage: MulticastMessage }>) {
    const { multicastMessage } = job.data;
    await this.firebaseAdminService.sendPushNotification(multicastMessage);
  }
}
