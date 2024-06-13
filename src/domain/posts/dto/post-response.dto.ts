import { Post } from '../schemas/post.schema';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { UserResponseDto } from '@/domain/auth/users/dto/user-response.dto';

export class PostResponseDto {
  readonly postNumber: number;
  readonly user: UserResponseDto;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date | null;

  constructor(post: Post, user: User) {
    this.postNumber = post.postNumber;
    this.user = new UserResponseDto(user);
    this.title = post.title;
    this.content = post.content;
    this.createdAt = post.createdAt;
    this.updatedAt = post.updatedAt;
    this.deletedAt = post.deletedAt;
  }
}
