import { HttpStatus } from '@nestjs/common';
import { BaseException, FirebaseExceptionEnum } from '@/common';

export class FirebaseUnsubscribeException extends BaseException {
  constructor(message: string) {
    super(
      FirebaseExceptionEnum.UNSUBSCRIBE_FAILED,
      HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    );
  }
}
