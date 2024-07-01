import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '@/domain/notification/schemas/notification.schema';
import { NotificationService } from '@/domain/notification/notification.service';
import { NotificationRepository } from '@/domain/notification/notification.repository';
import { NotificationController } from '@/domain/notification/notification.controller';
import { UserDeviceModule } from '@/domain/device/user-device.module';
import { NotificationProcessor } from '@/domain/notification/notification.processor';
import { FirebaseAdminModule } from '@/domain/firebase/firebase-admin.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue(
      {
        name: 'notification',
      },
      {
        name: 'global-notification',
      },
    ),
    MongooseModule.forFeature([
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
    UserDeviceModule,
    FirebaseAdminModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationProcessor,
  ],
  exports: [BullModule, NotificationService, NotificationRepository],
})
export class NotificationModule {}
