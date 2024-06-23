import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { MessageType } from '@/domain/chat/@types/enums/message-type.enum';

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
  @IsEnum(MessageType)
  readonly messageType: MessageType = MessageType.TEXT;
}
