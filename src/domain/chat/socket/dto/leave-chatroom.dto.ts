import { IsString } from 'class-validator';

export class LeaveChatroomDto {
  @IsString()
  chatroomId: string;
}
