import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import RequestWithUser from '@/domain/auth/interfaces/request-with-user.interface';
import { HttpResponse } from '@/common/dto/http-response';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: RequestWithUser,
    @Body() createPostDto: CreatePostDto,
  ) {
    const post = await this.postsService.create(req.user.userId, createPostDto);
    return HttpResponse.created(
      '게시글이 생성되었습니다.',
      new PostResponseDto(post, req.user),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() pageOptionsDto?: PageOptionsDto) {
    const { posts, total } = await this.postsService.findAll(pageOptionsDto);
    const { data, meta } = new PageDto(
      posts,
      new PageMetaDto(pageOptionsDto, total),
    );
    return HttpResponse.success('모든 게시글이 조회되었습니다.', data, meta);
  }

  @Get('/:postNumber')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('postNumber') postNumber: number) {
    const { post, user } = await this.postsService.findOne(postNumber);
    return HttpResponse.success(
      '게시글이 조회되었습니다.',
      new PostResponseDto(post, user),
    );
  }

  @Patch('/:postNumber')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('postNumber') postNumber: number,
    @Req() req: RequestWithUser,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const { updatedPost, user } = await this.postsService.update(
      postNumber,
      req.user.userId,
      updatePostDto,
    );
    return HttpResponse.success(
      '게시글이 수정되었습니다.',
      new PostResponseDto(updatedPost, user),
    );
  }

  @Delete('/:postNumber')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('postNumber') postNumber: number,
    @Req() req: RequestWithUser,
  ) {
    await this.postsService.delete(postNumber, req.user.userId);
    return HttpResponse.success('게시글이 삭제되었습니다.');
  }
}
