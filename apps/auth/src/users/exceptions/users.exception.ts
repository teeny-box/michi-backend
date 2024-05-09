import { BaseException, UserExceptionEnum } from '@/common';
import { HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends BaseException {
  constructor(message: string) {
    super(UserExceptionEnum.USER_NOT_FOUND, HttpStatus.NOT_FOUND, message);
  }
}

export class UserBadRequestException extends BaseException {
  constructor(message: string) {
    super(UserExceptionEnum.USER_BAD_REQUEST, HttpStatus.BAD_REQUEST, message);
  }
}
