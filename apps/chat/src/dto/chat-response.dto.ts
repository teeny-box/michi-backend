import {IsDate, IsNotEmpty, IsString} from "class-validator";
import {Chat} from "../schemas/chat.schema";
import {User} from "../../../auth/src/users/schemas/user.schema";

export class ChatResponseDto {
  @IsString()
  @IsNotEmpty()
  readonly message: string;

  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @IsString()
  @IsNotEmpty()
  readonly createdAt: string;

  constructor(chat: Chat, user: User) {
    this.message = chat.message;
    this.username = user.nickname;
    this.createdAt = chat.createdAt.toISOString();
  }
}