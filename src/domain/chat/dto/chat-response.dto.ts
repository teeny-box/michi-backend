import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Chat } from '../schemas/chat.schema';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { UserResponseDto } from '@/domain/auth/users/dto/user-response.dto';
import { FileType } from '@/common/enums/file-type.enum';

export class ChatResponseDto {
  @IsString()
  @IsNotEmpty()
  readonly message: string;

  readonly user: UserResponseDto;

  @IsString()
  @IsNotEmpty()
  readonly chatroomId: string;

  @IsEnum(FileType)
  readonly fileType: FileType;

  @IsString()
  @IsOptional()
  readonly fileUrl?: string;

  @IsString()
  @IsNotEmpty()
  readonly createdAt: Date;

  constructor(chat: Chat, user: User) {
    this.message = chat.message;
    this.user = new UserResponseDto(user);
    this.chatroomId = chat.chatroomId;
    this.fileType = chat.fileType;
    this.fileUrl = chat.fileUrl;
    this.createdAt = chat.createdAt;
  }
}
