import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FileType } from '@/common/enums/message-type.enum';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly chatroomId: string;

  @IsString()
  @IsNotEmpty()
  readonly message: string;

  @IsEnum(FileType)
  @IsOptional()
  readonly fileType?: FileType = FileType.NONE;

  @IsString()
  @IsOptional()
  readonly fileUrl?: string;
}
