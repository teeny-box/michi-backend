import { BaseException, NotificationExceptionEnum } from '@/libs/common';
import { HttpStatus } from '@nestjs/common';

export class FirebaseException extends BaseException {
  constructor(message: string) {
    super(
      NotificationExceptionEnum.FCM_SEND_FAILED,
      HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    );
  }
}
