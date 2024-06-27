import { HttpStatus } from '@nestjs/common';
import { BaseException, PostExceptionEnum } from '@/common';

export class PostForbiddenException extends BaseException {
  constructor(message: string) {
    super(PostExceptionEnum.POST_FORBIDDEN, HttpStatus.FORBIDDEN, message);
  }
}

export class PostNotFoundException extends BaseException {
  constructor(message: string) {
    super(PostExceptionEnum.POST_NOT_FOUND, HttpStatus.NOT_FOUND, message);
  }
}
