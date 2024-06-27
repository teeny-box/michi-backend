import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { FirebaseAdminService } from '@/domain/firebase/firebase-admin.service';
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
    BullModule.registerQueue({
      name: 'notification',
    }),
    FirebaseAdminModule,
  ],
  providers: [FirebaseAdminService],
  exports: [BullModule],
})
export class NotificationModule {}
