import { HttpStatus } from '@nestjs/common';
import { UncatchedExceptionEnum } from './exception.enum';
import { BaseException } from './base.exception';

export class UncatchedException extends BaseException {
  constructor(statusCode: number, message: string) {
    super(
      UncatchedExceptionEnum.UNCATCHED,
      HttpStatus.INTERNAL_SERVER_ERROR,
      '현재 이용이 원활하지 않습니다.',
    );
    this.statusCode = statusCode;
    this.message = message;
  }
}
