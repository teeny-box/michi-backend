import { IsString } from 'class-validator';
import { FileType } from '@/common/enums/file-type.enum';

export class SendMessageDto {
  @IsString()
  chatroomId: string;
  @IsString()
  message: string;
  fileUrl?: string;
  fileType?: FileType;
}
