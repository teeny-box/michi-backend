import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { FirebaseAdminService } from '@/libs/common/firebase/firebase-admin.service';

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
  ],
  providers: [FirebaseAdminService],
  exports: [BullModule],
})
export class NotificationModule {}
