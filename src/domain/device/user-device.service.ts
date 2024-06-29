import { UserDeviceRepository } from '@/domain/device/user-device.repository';
import { Injectable } from '@nestjs/common';
import { CreateUserDeviceDto } from '@/domain/device/dto/create-user-device.dto';
import { FirebaseAdminService } from '@/domain/firebase/firebase-admin.service';
import { UserDeviceNotFoundException } from '@/domain/device/exceptions/user-device.exception';
import { FirebaseUnsubscribeException } from '@/domain/firebase/exceptions/firebase.exception';

@Injectable()
export class UserDeviceService {
  constructor(
    private readonly userDeviceRepository: UserDeviceRepository,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  async createOrUpdateUserDevice(
    userId: string,
    createUserDeviceDto: CreateUserDeviceDto,
  ) {
    const { clientInfo, fcmRegistrationToken } = createUserDeviceDto;

    const existingDevice = await this.userDeviceRepository.findOne({
      userId,
      fcmRegistrationToken,
    });

    let device;
    if (existingDevice) {
      device = await this.userDeviceRepository.findOneAndUpdate(
        { _id: existingDevice._id },
        {
          clientInfo,
          fcmRegistrationToken,
          isDeleted: false,
        },
      );
    } else {
      device = await this.userDeviceRepository.create({
        userId,
        clientInfo,
        fcmRegistrationToken,
      });
    }

    await this.firebaseAdminService.subscribeToGlobalTopic(
      fcmRegistrationToken,
    );

    return device;
  }

  async getUserDevices(userId: string) {
    return this.userDeviceRepository.find({ userId });
  }

  async getFcmTokensByUserId(userId: string) {
    const devices = await this.userDeviceRepository.find({
      userId,
      isDeleted: false,
    });
    return devices.results.map((device) => device.fcmRegistrationToken);
  }

  async getFcmTokensByUserIds(userIds: string[]) {
    const devices = await this.userDeviceRepository.find({
      userId: { $in: userIds },
      isDeleted: false,
    });
    return devices.results.map((device) => device.fcmRegistrationToken);
  }

  async removeUserDevice(userId: string, fcmRegistrationToken: string) {
    const [unsubscribeResult, updatedResult] = await Promise.all([
      this.firebaseAdminService.unsubscribeFromGlobalTopic(
        fcmRegistrationToken,
      ),
      this.userDeviceRepository.findOneAndUpdate(
        { userId, fcmRegistrationToken, isDeleted: false },
        { isDeleted: true },
      ),
    ]);

    if (!updatedResult) {
      throw new UserDeviceNotFoundException('해당 기기를 찾을 수 없습니다.');
    }

    if (!unsubscribeResult) {
      throw new FirebaseUnsubscribeException('구독 취소에 실패했습니다.');
    }
  }
}
