import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(26, { message: '게시글 제목은 26자를 넘을 수 없습니다.' })
  @MinLength(1, { message: '게시글 제목은 최소 1자 이상이어야 합니다.' })
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @MaxLength(224, {
    message: '게시글 내용은 공백 포함 224자를 넘을 수 없습니다.',
  })
  @MinLength(1, { message: '게시글 내용은 최소 1자 이상이어야 합니다.' })
  @IsNotEmpty()
  readonly content: string;
}
