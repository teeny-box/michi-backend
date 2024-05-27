import {Process, Processor} from "@nestjs/bull";
import {FirebaseAdminService} from "@/common/firebase/firebase-admin.service";
import {Job} from "bull";

@Processor('notification')
export class NotificationProcessor {
    constructor(private readonly firebaseAdminService: FirebaseAdminService) {}

    @Process()
    async sendPushNotification(job: Job) {
        const { token, title, message } = job.data;
        await this.firebaseAdminService.sendPushNotification(token, title, message);
    }
}