import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { Chat } from './schemas/chat.schema';
import { ObjectId } from 'mongodb';
import { UsersService } from '@auth/users/users.service';
import { User } from '@auth/users/schemas/user.schema';
import { Role, State } from '@auth/@types/enums/user.enum';

describe('ChatController', () => {
  let chatController: ChatController;
  let chatService: ChatService;
  let usersService: UsersService;

  const mockChatService = {
    find: jest.fn(),
  };

  const mockUsersService = {
    findByUserIds: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    chatController = app.get<ChatController>(ChatController);
    chatService = app.get<ChatService>(ChatService);
    usersService = app.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(chatController).toBeDefined();
  });

  describe('findAllByChatroomId', () => {
    it('it should return chat messages with user information', async () => {
      const chatroomId = 'chatroomId';
      const pageOptionsDto: PageOptionsDto = {
        page: 1,
        pageSize: 10,
        get skip(): number {
          return (this.page - 1) * this.pageSize;
        },
      };
      const chats: Chat[] = [
        {
          _id: new ObjectId('chat1'),
          chatroomId: chatroomId,
          userId: 'user1',
          message: 'Hello, World!',
          createdAt: new Date(),
        },
        {
          _id: new ObjectId('chat2'),
          chatroomId: chatroomId,
          userId: 'user2',
          message: 'Hi, there!',
          createdAt: new Date(),
        },
      ];
      const total = chats.length;
      const users: User[] = [
        {
          _id: new ObjectId('user1'),
          userId: 'user1',
          userName: 'Alice',
          nickname: 'Alice',
          password: 'password1',
          birthYear: '1997',
          phoneNumber: '010123456',
          profileImage: 'profile1',
          role: Role.USER,
          state: State.JOINED,
          deletedAt: null,
        },
        {
          _id: new ObjectId('user2'),
          userId: 'user2',
          userName: 'Bob',
          nickname: 'Bob',
          password: 'password1',
          birthYear: '1997',
          phoneNumber: '010123456',
          profileImage: 'profile1',
          role: Role.USER,
          state: State.JOINED,
          deletedAt: null,
        },
      ];

      mockChatService.find.mockResolvedValue({ results: chats, total });
      mockUsersService.findByUserIds.mockResolvedValue(users);

      const result = await chatController.findAllByChatroomId(
        chatroomId,
        pageOptionsDto,
      );

      const userMap = new Map(users.map((user) => [user.userId, user]));
      const expectedChats = chats.map(
        (chat) => new ChatResponseDto(chat, userMap.get(chat.userId)),
      );
      const expectedMeta = new PageMetaDto(pageOptionsDto, total);
      const expectedResponse = HttpResponse.success(
        `조회가 완료되었습니다.`,
        expectedChats,
        expectedMeta,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockChatService.find).toHaveBeenCalledWith(
        chatroomId,
        pageOptionsDto,
      );
      expect(mockUsersService.findByUserIds).toHaveBeenCalledWith([
        'user1',
        'user2',
      ]);
    });
  });
});
