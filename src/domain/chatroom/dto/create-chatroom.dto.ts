import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';

export class CreateChatroomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(ChatRoomType)
  @IsNotEmpty()
  type: ChatRoomType;

  @IsArray()
  @IsNotEmpty()
  userIds: string[];

  constructor(title: string, type: ChatRoomType, userIds: string[]) {
    this.title = title;
    this.type = type;
    this.userIds = userIds;
  }
}
