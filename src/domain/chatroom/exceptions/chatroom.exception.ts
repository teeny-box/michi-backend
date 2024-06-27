import { HttpStatus } from '@nestjs/common';
import { BaseException, ChatroomExceptionEnum } from '@/common';

export class ChatroomNotFoundException extends BaseException {
  constructor(message: string) {
    super(
      ChatroomExceptionEnum.CHATROOM_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      message,
    );
  }
}

export class NotEnoughUserInChatQueueException extends BaseException {
  constructor(message: string) {
    super(
      ChatroomExceptionEnum.NOT_ENOUGH_USER_IN_CHAT_QUEUE,
      HttpStatus.BAD_REQUEST,
      message,
    );
  }
}
