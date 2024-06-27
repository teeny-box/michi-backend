import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomController } from '@/domain/chatroom/chatroom.controller';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { ChatroomResponseDto } from '@/domain/chatroom/dto/chatroom-response.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { CreateChatroomDto } from '@/domain/chatroom/dto/create-chatroom.dto';
import { chatroomMock } from './mocks/chatroom.mock';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';
import { Types } from 'mongoose';

describe('ChatroomController', () => {
  let chatroomController: ChatroomController;
  let chatroomService: ChatroomService;

  const mockChatroomService = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatroomController],
      providers: [{ provide: ChatroomService, useValue: mockChatroomService }],
    }).compile();

    chatroomController = app.get<ChatroomController>(ChatroomController);
    chatroomService = app.get<ChatroomService>(ChatroomService);
  });

  it('should be defined', () => {
    expect(chatroomController).toBeDefined();
  });

  describe('find', () => {
    it('should return a paginated list of chatrooms', async () => {
      // Given
      const userId = 'userId';
      const pageOptionsDto: PageOptionsDto = {
        page: 1,
        pageSize: 10,
        get skip() {
          return (this.page - 1) * this.pageSize;
        },
      };
      const chatrooms = [chatroomMock];
      const total = chatrooms.length;

      mockChatroomService.find.mockResolvedValue({ results: chatrooms, total });

      // When
      const result = await chatroomController.find(userId, pageOptionsDto);

      // Then
      const expectedData = new PageDto(
        chatrooms.map((chatroom) => new ChatroomResponseDto(chatroom)),
        new PageMetaDto(pageOptionsDto, total),
      );

      expect(result).toEqual(
        HttpResponse.success(
          '채팅방 조회가 완료되었습니다.',
          expectedData.data,
          expectedData.meta,
        ),
      );
      expect(mockChatroomService.find).toHaveBeenCalledWith(
        userId,
        pageOptionsDto,
      );
    });
  });

  describe('create', () => {
    it('should create a new chatroom and return it', async () => {
      // Given
      const createChatroomDto = new CreateChatroomDto(
        'title',
        ChatRoomType.PRIVATE,
        'userId',
      );
      const createdChatroom = {
        _id: new Types.ObjectId('664e1bdc14426cbe69b15ce9'),
        userIds: new Set(['userId']),
        lastMessageId: 'lastMessageIdMock',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...createChatroomDto,
      };

      mockChatroomService.create.mockResolvedValue(createdChatroom);

      // When
      const result = await chatroomController.create(createChatroomDto);

      // Then
      expect(result).toEqual(
        HttpResponse.success(
          '채팅방이 생성되었습니다.',
          new ChatroomResponseDto(createdChatroom),
        ),
      );
      expect(mockChatroomService.create).toHaveBeenCalledWith(
        createChatroomDto,
      );
    });
  });
});
