import { BaseException, ChatroomExceptionEnum } from '@/libs/common';
import { HttpStatus } from '@nestjs/common';

export class ChatroomNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      ChatroomExceptionEnum.CHATROOM_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}
