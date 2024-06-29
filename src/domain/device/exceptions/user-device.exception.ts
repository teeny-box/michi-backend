import { BaseException, DeviceExceptionEnum } from '@/common';
import { HttpStatus } from '@nestjs/common';

export class UserDeviceNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      DeviceExceptionEnum.USER_DEVICE_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}
