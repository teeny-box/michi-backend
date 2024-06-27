import { HttpStatus } from '@nestjs/common';
import { BaseException, UserExceptionEnum } from '@/common';

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

export class UserIdDuplicateException extends BaseException {
  constructor(message: string) {
    super(UserExceptionEnum.USER_ID_DUPLICATE, HttpStatus.BAD_REQUEST, message);
  }
}

export class UserNicknameDuplicateException extends BaseException {
  constructor(message: string) {
    super(
      UserExceptionEnum.USER_NICKNAME_DUPLICATE,
      HttpStatus.BAD_REQUEST,
      message,
    );
  }
}
