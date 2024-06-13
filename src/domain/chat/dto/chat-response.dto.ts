import { IsNotEmpty, IsString } from 'class-validator';
import { Chat } from '../schemas/chat.schema';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { UserResponseDto } from '@/domain/auth/users/dto/user-response.dto';

export class ChatResponseDto {
  @IsString()
  @IsNotEmpty()
  readonly message: string;

  readonly user: UserResponseDto;

  // @IsString()
  // @IsNotEmpty()
  // readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  readonly createdAt: string;

  constructor(chat: Chat, user: User) {
    this.message = chat.message;
    // this.nickname = user.nickname;
    this.user = new UserResponseDto(user);
    this.createdAt = chat.createdAt.toISOString();
  }
}
