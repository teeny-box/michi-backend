import { ChatService } from '@/domain/chat/chat.service';
import { ChatController } from '@/domain/chat/chat.controller';
import { UsersService } from '@/domain/auth/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { Chat } from '@/domain/chat/schemas/chat.schema';
import { Types } from 'mongoose';
import { MessageType } from '@/common/enums/message-type.enum';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { Role, State } from '@/common/enums/user.enum';
import { ChatResponseDto } from '@/domain/chat/dto/chat-response.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { RedisCacheService } from '@/common';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';

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

  const mockRedisCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockChatroomService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
        { provide: ChatroomService, useValue: mockChatroomService },
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
      // Given
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
          _id: new Types.ObjectId('664e1bdc14426cbe69b15ce9'),
          chatroomId: chatroomId,
          userId: 'user1',
          message: 'Hello, World!',
          messageType: MessageType.TEXT,
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId('664e1bdc14426cbe69b15c14'),
          chatroomId: chatroomId,
          userId: 'user2',
          message: 'Hi, there!',
          messageType: MessageType.TEXT,
          createdAt: new Date(),
        },
      ];
      const total = chats.length;
      const users: User[] = [
        {
          _id: new Types.ObjectId('664e1bdc14426cbe69b343e9'),
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
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          _id: new Types.ObjectId('664e1bd3e4426cbe69b343e9'),
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
          createdAt: undefined,
          updatedAt: undefined,
        },
      ];

      mockChatService.find.mockResolvedValue({ results: chats, total });
      mockUsersService.findByUserIds.mockResolvedValue(users);

      // When
      const result = await chatController.findAllByChatroomId(
        chatroomId,
        pageOptionsDto,
      );

      // Then
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
