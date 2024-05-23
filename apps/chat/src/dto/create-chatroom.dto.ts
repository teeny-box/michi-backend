import { ChatRoomType } from '../@types/enums/chatroomtype.enum';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatroomDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsEnum(ChatRoomType)
  @IsNotEmpty()
  readonly type: ChatRoomType;

  @IsString()
  @IsNotEmpty()
  readonly ownerId: string;
}
