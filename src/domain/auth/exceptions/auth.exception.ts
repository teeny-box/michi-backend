import { HttpStatus } from '@nestjs/common';
import { AuthExceptionEnum, BaseException } from '@/common';

export class UserUnauthorizedException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.USER_UNAUTHORIZED,
      HttpStatus.UNAUTHORIZED,
      message,
    );
  }
}

export class NotExpiredAccessTokenException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.NOT_EXPIRED_ACCESS_TOKEN,
      HttpStatus.UNAUTHORIZED,
      message,
    );
  }
}

export class InvalidTokenException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.INVALID_TOKEN, HttpStatus.UNAUTHORIZED, message);
  }
}

export class PasswordMismatchException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.PASSWORD_MISMATCH,
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

export class UserConflictException extends BaseException {
  constructor(message: string) {
    super(AuthExceptionEnum.USER_CONFLICT, HttpStatus.CONFLICT, message);
  }
}

export class NoTokenProvidedException extends BaseException {
  constructor(message: string) {
    super(
      AuthExceptionEnum.NO_TOKEN_PROVIDED,
      HttpStatus.UNAUTHORIZED,
      message,
    );
  }
}
