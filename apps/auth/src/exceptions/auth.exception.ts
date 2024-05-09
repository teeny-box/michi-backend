import { AuthExceptionEnum, BaseException } from '@/common';
import { HttpStatus } from '@nestjs/common';

export class UserUnauthorizedException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.USER_UNAUTHORIZED,
      HttpStatus.UNAUTHORIZED,
      message,
    );
  }
}

export class UserForbiddenException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.USER_FORBIDDEN, HttpStatus.FORBIDDEN, message);
  }
}

export class UserWithdrawnException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.USER_WITHDRAWN, HttpStatus.FORBIDDEN, message);
  }
}
