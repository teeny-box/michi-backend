import { CounterService } from '@/common';
import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './schemas/post.schema';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  PostForbiddenException,
  PostNotFoundException,
} from './exceptions/posts.exception';
import { UsersService } from '@auth/users/users.service';
import { User } from '@auth/users/schemas/user.schema';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly counterService: CounterService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    const postNumber =
      await this.counterService.getNextSequenceValue('postNumber');

    return await this.postsRepository.create({
      postNumber,
      userId,
      ...createPostDto,
    });
  }

  async findAll(pageOptionsDto?: PageOptionsDto) {
    const { results, total } = await this.postsRepository.find(
      {},
      pageOptionsDto,
      { createdAt: -1 },
    );

    const postsWithUser = await Promise.all(
      results.map(async (post) => {
        const user = await this.usersService.findByUserId(post.userId);
        return new PostResponseDto(post, user);
      }),
    );

    return { posts: postsWithUser, total };
  }

  async findOne(postNumber: number): Promise<{ post: Post; user: User }> {
    const post = await this.postsRepository.findOne({ postNumber });
    if (!post) {
      throw new PostNotFoundException('게시글을 찾을 수 없습니다.');
    }

    const user = await this.usersService.findByUserId(post.userId);

    return { post, user };
  }

  async update(
    postNumber: number,
    userId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<{ updatedPost: Post; user: User }> {
    const { post, user } = await this.findOne(postNumber);
    if (post.userId !== userId) {
      throw new PostForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    const updatedPost = await this.postsRepository.findOneAndUpdate(
      { postNumber },
      updatePostDto,
    );

    return { updatedPost, user };
  }

  async delete(postNumber: number, userId: string): Promise<void> {
    const { post } = await this.findOne(postNumber);
    if (post.userId !== userId) {
      throw new PostForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    await this.postsRepository.findOneAndUpdate(
      { postNumber },
      { deletedAt: new Date() },
    );
  }
}
