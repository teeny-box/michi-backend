import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '@/domain/notification/schemas/notification.schema';
import { NotificationService } from '@/domain/notification/notification.service';
import { NotificationRepository } from '@/domain/notification/notification.repository';
import { NotificationController } from '@/domain/notification/notification.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
    MongooseModule.forFeature([
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [BullModule, NotificationService, NotificationRepository],
})
export class NotificationModule {}
