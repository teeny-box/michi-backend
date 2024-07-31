import { ChatService } from '@/domain/chat/chat.service';
import { ChatController } from '@/domain/chat/chat.controller';
import { UsersService } from '@/domain/auth/users/users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { Chat } from '@/domain/chat/schemas/chat.schema';
import { Types } from 'mongoose';
import { FileType } from '@/common/enums/file-type.enum';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { Role, State } from '@/common/enums/user.enum';
import { ChatResponseDto } from '@/domain/chat/dto/chat-response.dto';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { RedisCacheService } from '@/common';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';
import RequestWithUser from '@/common/interfaces/request-with-user.interface';
import { ChatroomResponseDto } from '@/domain/chatroom/dto/chatroom-response.dto';
import { CreateChatroomDto } from '@/domain/chatroom/dto/create-chatroom.dto';
import { ChatRoomType } from '@/common/enums/chatroomtype.enum';
import { NotEnoughUserInChatQueueException } from '@/domain/chatroom/exceptions/chatroom.exception';

describe('ChatController', () => {
  let chatController: ChatController;

  const mockChatService = {
    find: jest.fn(),
  };

  const mockUsersService = {
    findByUserIds: jest.fn(),
  };

  const mockRedisCacheService = {
    getNextUserFromChatQueue: jest.fn(),
    addUserToChatQueue: jest.fn(),
  };

  const mockChatroomService = {
    create: jest.fn(),
    resetUnreadCount: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(chatController).toBeDefined();
  });

  describe('findAllByChatroomId', () => {
    it('it should return chat messages with user information', async () => {
      // Given
      const chatroomId = 'chatroomId';
      const pageOptionsDto = new PageOptionsDto(1, 10);
      const req = { user: { userId: 'user1' } } as RequestWithUser;

      const chats: Chat[] = [
        {
          _id: new Types.ObjectId('664e1bdc14426cbe69b15ce9'),
          chatroomId: chatroomId,
          userId: 'user1',
          message: 'Hello, World!',
          fileType: FileType.NONE,
          createdAt: new Date(),
        },
        {
          _id: new Types.ObjectId('664e1bdc14426cbe69b15c14'),
          chatroomId: chatroomId,
          userId: 'user2',
          message: 'Hi, there!',
          fileType: FileType.NONE,
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
          notificationCheckedAt: new Date(),
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
          notificationCheckedAt: new Date(),
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
        req,
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

      expect(mockChatroomService.resetUnreadCount).toHaveBeenCalledWith(
        chatroomId,
        'user1',
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

    describe('startRandomChat', () => {
      it('should start a random chat when another user is available', async () => {
        // Given
        const req = { user: { userId: 'user1' } } as RequestWithUser;
        const receiver = 'user2';
        const chatroom = {
          _id: new Types.ObjectId('664e1bdc14426cbe69b15ce9'),
          title: 'user1, user2',
          type: ChatRoomType.PRIVATE,
          userIds: ['user1', 'user2'],
          lastMessage: '',
          unreadCount: 0,
          userUnreadCounts: {},
          joinedUserIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

        mockRedisCacheService.getNextUserFromChatQueue.mockResolvedValueOnce(
          receiver,
        );
        mockChatroomService.create.mockResolvedValueOnce(chatroom);

        // When
        const result = await chatController.startRandomChat(req);

        // Then
        expect(result).toEqual(
          HttpResponse.success(
            `${receiver}님과 채팅을 시작합니다.`,
            new ChatroomResponseDto(chatroom, 'user1'),
          ),
        );
        expect(
          mockRedisCacheService.getNextUserFromChatQueue,
        ).toHaveBeenCalledTimes(1);
        expect(mockChatroomService.create).toHaveBeenCalledWith(
          new CreateChatroomDto(`user1, ${receiver}`, ChatRoomType.PRIVATE, [
            'user1',
            receiver,
          ]),
        );
        expect(mockRedisCacheService.addUserToChatQueue).toHaveBeenCalledWith(
          receiver,
        );
      });

      it('should throw NotEnoughUserInChatQueueException when no other user is available', async () => {
        // Given
        const req = { user: { userId: 'user1' } } as RequestWithUser;
        mockRedisCacheService.getNextUserFromChatQueue.mockResolvedValue(null);

        // When & Then
        await expect(chatController.startRandomChat(req)).rejects.toThrow(
          NotEnoughUserInChatQueueException,
        );
      });
    });
  });
});
