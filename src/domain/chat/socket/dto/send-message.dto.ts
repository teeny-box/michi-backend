import { IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  chatroomId: string;
  @IsString()
  message: string;
}
