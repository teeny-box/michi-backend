import { PostsController } from '@/domain/posts/posts.controller';
import { PostsService } from '@/domain/posts/posts.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostDto } from '@/domain/posts/dto/create-post.dto';
import RequestWithUser from '@/common/interfaces/request-with-user.interface';
import { HttpResponse } from '@/common/dto/http-response';
import { PostResponseDto } from '@/domain/posts/dto/post-response.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PostNotFoundException } from '@/domain/posts/exceptions/posts.exception';
import { UpdatePostDto } from '@/domain/posts/dto/update-post.dto';
import { mockUser } from './mocks/user.mock';
import { mockPost } from './mocks/post.mock';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'This is a test post.',
      };

      jest
        .spyOn(postsService, 'create')
        .mockImplementation(async () => mockPost);

      const result = await postsController.create(
        { user: mockUser } as RequestWithUser,
        createPostDto,
      );
      expect(result).toEqual(
        HttpResponse.created(
          '게시글이 생성되었습니다.',
          new PostResponseDto(mockPost, mockUser),
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should find all posts', async () => {
      const pageOptionsDto: PageOptionsDto = {
        page: 1,
        pageSize: 10,
        skip: 0,
      };

      const mockPosts = [mockPost];
      const mockTotal = 2;
      const expectedPosts = mockPosts.map(
        (post) => new PostResponseDto(post, mockUser),
      );

      jest.spyOn(postsService, 'findAll').mockImplementation(async () => ({
        posts: expectedPosts,
        total: mockTotal,
      }));

      const result = await postsController.findAll(pageOptionsDto);
      expect(result).toEqual(
        HttpResponse.success(
          '모든 게시글이 조회되었습니다.',
          expectedPosts,
          new PageMetaDto(pageOptionsDto, mockTotal),
        ),
      );
    });
  });

  describe('findOne', () => {
    it('should find one post', async () => {
      const mockPostNumber = 1;

      jest
        .spyOn(postsService, 'findOne')
        .mockImplementation(async () => ({ post: mockPost, user: mockUser }));

      const result = await postsController.findOne(mockPostNumber);
      expect(result).toEqual(
        HttpResponse.success(
          '게시글이 조회되었습니다.',
          new PostResponseDto(mockPost, mockUser),
        ),
      );
    });

    it('should throw PostNotFoundException', async () => {
      const mockPostNumber = 999;

      jest.spyOn(postsService, 'findOne').mockImplementation(async () => {
        throw new PostNotFoundException('게시글을 찾을 수 없습니다.');
      });

      await expect(postsController.findOne(mockPostNumber)).rejects.toThrow(
        PostNotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const mockPostNumber = 1;
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Test Post',
        content: 'This is an updated test post.',
      };
      const mockUpdatedPost = { ...mockPost, ...updatePostDto };

      jest.spyOn(postsService, 'update').mockImplementation(async () => ({
        updatedPost: mockUpdatedPost,
        user: mockUser,
      }));

      const result = await postsController.update(
        mockPostNumber,
        { user: mockUser } as RequestWithUser,
        updatePostDto,
      );
      expect(result).toEqual(
        HttpResponse.success(
          '게시글이 수정되었습니다.',
          new PostResponseDto(mockUpdatedPost, mockUser),
        ),
      );
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      const mockPostNumber = 1;

      jest.spyOn(postsService, 'delete').mockImplementation(async () => {});

      const result = await postsController.delete(mockPostNumber, {
        user: mockUser,
      } as RequestWithUser);
      expect(result).toEqual(HttpResponse.success('게시글이 삭제되었습니다.'));
    });
  });
});
