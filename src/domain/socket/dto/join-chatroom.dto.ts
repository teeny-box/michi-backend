import { IsString } from 'class-validator';

export class JoinChatroomDto {
  @IsString()
  chatroomId: string;
}
