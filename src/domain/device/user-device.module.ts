import { forwardRef, Module } from '@nestjs/common';
import { UserDeviceService } from '@/domain/device/user-device.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserDeviceSchema } from '@/domain/device/schemas/user-device.schema';
import { UserDeviceRepository } from '@/domain/device/user-device.repository';
import { NotificationModule } from '@/domain/notification/notification.module';
import { UserDeviceController } from '@/domain/device/user-device.controller';
import { FirebaseAdminModule } from '@/domain/firebase/firebase-admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'UserDevice', schema: UserDeviceSchema },
    ]),
    forwardRef(() => NotificationModule),
    FirebaseAdminModule,
  ],
  controllers: [UserDeviceController],
  providers: [UserDeviceService, UserDeviceRepository],
  exports: [UserDeviceService],
})
export class UserDeviceModule {}
