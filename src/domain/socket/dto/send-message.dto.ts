import { IsEnum, IsString } from 'class-validator';
import { MessageType } from '@/common/enums/message-type.enum';

export class SendMessageDto {
  @IsString()
  chatroomId: string;
  @IsString()
  message: string;
  @IsEnum(MessageType)
  messageType: MessageType = MessageType.TEXT;
}
