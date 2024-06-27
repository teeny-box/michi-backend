import { HttpException } from '@nestjs/common';
import { IBaseException } from './base.exception.interface';

export class BaseException extends HttpException implements IBaseException {
  constructor(errorCode: string, statusCode: number, message: string) {
    super(errorCode, statusCode);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.message = message;
  }
  errorCode: string;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
