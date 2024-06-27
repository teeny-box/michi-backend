import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Chat } from '../schemas/chat.schema';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { UserResponseDto } from '@/domain/auth/users/dto/user-response.dto';
import { MessageType } from '@/common/enums/message-type.enum';

export class ChatResponseDto {
  @IsString()
  @IsNotEmpty()
  readonly message: string;

  readonly user: UserResponseDto;
  readonly chatroomId: string;

  @IsEnum(MessageType)
  readonly messageType: MessageType = MessageType.TEXT;

  @IsString()
  @IsNotEmpty()
  readonly createdAt: Date;

  constructor(chat: Chat, user: User) {
    this.message = chat.message;
    this.user = new UserResponseDto(user);
    this.createdAt = chat.createdAt;
    this.messageType = chat.messageType;
  }
}
