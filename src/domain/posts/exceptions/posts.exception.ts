import { BaseException, PostExceptionEnum } from '@/libs/common';
import { HttpStatus } from '@nestjs/common';

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
