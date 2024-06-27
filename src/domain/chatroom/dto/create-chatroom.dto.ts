import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';

export class CreateChatroomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ChatRoomType)
  @IsNotEmpty()
  type: ChatRoomType;

  @IsString()
  @IsNotEmpty()
  ownerId: string;

  constructor(title: string, type: ChatRoomType, ownerId: string) {
    this.title = title;
    this.type = type;
    this.ownerId = ownerId;
  }
}
