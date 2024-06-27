import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ChatService } from '@/domain/chat/chat.service';
import { UsersService } from '@/domain/auth/users/users.service';
import { AuthService } from '@/domain/auth/auth.service';
import { getQueueToken } from '@nestjs/bull';
import { Socket, io } from 'socket.io-client';
import { RedisCacheService } from '@/common';
import { SocketGateway } from '@/domain/socket/socket.gateway';
import { ChatroomService } from '@/domain/chatroom/chatroom.service';

describe('SocketGateway', () => {
  let app: INestApplication;
  let socketClient: Socket;
  let authService: AuthService;

  const mockChatService = {
    create: jest.fn(),
  };
  const mockChatroomService = {
    findOne: jest.fn(),
    joinChatRoom: jest.fn(),
    leaveChatRoom: jest.fn(),
    getReceivers: jest.fn(),
  };
  const mockUsersService = {
    findByUserId: jest.fn(),
    getFcmTokensByUserIds: jest.fn(),
  };
  const mockRedisCacheService = {
    setUserOnline: jest.fn(),
    setUserOffline: jest.fn(),
    isUserInChatQueue: jest.fn(),
    addUserToChatQueue: jest.fn(),
    removeUserFromChatQueue: jest.fn(),
  };
  const mockAuthService = {
    getUserByToken: jest.fn(),
  };
  const mockQueue = {
    add: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        SocketGateway,
        { provide: ChatService, useValue: mockChatService },
        { provide: ChatroomService, useValue: mockChatroomService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: getQueueToken('notification'), useValue: mockQueue },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0); // 랜덤 포트로 서버 시작

    const httpServer = app.getHttpServer();
    const port = httpServer.address().port;
    socketClient = io(`http://localhost:${port}/socket/chat`, {
      autoConnect: false,
      transports: ['websocket'],
    });

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
    socketClient.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect with valid token', (done) => {
    const mockUser = { userId: '123', nickname: 'testUser' };
    mockAuthService.getUserByToken.mockResolvedValue(mockUser);

    socketClient.io.opts.extraHeaders = {
      authorization: 'valid_token',
    };

    socketClient.connect();

    socketClient.on('connect', () => {
      expect(mockAuthService.getUserByToken).toHaveBeenCalledWith(
        'valid_token',
      );
      expect(mockRedisCacheService.setUserOnline).toHaveBeenCalledWith('123');
      done();
    });
  });

  // it('should not connect with invalid token', (done) => {
  //   mockAuthService.getUserByToken.mockRejectedValue(
  //     new UserUnauthorizedException('Invalid token'),
  //   );
  //
  //   socketClient.io.opts.extraHeaders = {
  //     authorization: 'invalid_token',
  //   };
  //
  //   socketClient.connect();
  //
  //   socketClient.on('connect_error', (err) => {
  //     expect(err.message).toBe('Invalid token');
  //     done();
  //   });
  // });

  // it('should handle join event', (done) => {
  //   const mockUser = { userId: '123', nickname: 'testUser' };
  //   const mockChatroom = { id: 'room1' };
  //   mockAuthService.getUserByToken.mockResolvedValue(mockUser);
  //   mockUsersService.findByUserId.mockResolvedValue(mockUser);
  //   mockChatroomService.findOne.mockResolvedValue(mockChatroom);
  //
  //   socketClient.io.opts.extraHeaders = {
  //     authorization: 'valid_token',
  //   };
  //
  //   socketClient.connect();
  //
  //   socketClient.on('connect', () => {
  //     socketClient.emit('join', { chatroomId: 'room1' });
  //   });
  //
  //   socketClient.on('onJoin', (data) => {
  //     expect(data.message).toBe('testUser님이 입장하셨습니다');
  //     expect(mockChatroomService.joinChatRoom).toHaveBeenCalledWith(
  //       '123',
  //       'room1',
  //     );
  //     done();
  //   });
  // });

  // it('should handle message event', (done) => {
  //   const mockUser = { userId: '123', nickname: 'testUser' };
  //   const mockChat = { id: 'chat1', message: 'Hello' };
  //   mockAuthService.getUserByToken.mockResolvedValue(mockUser);
  //   mockUsersService.findByUserId.mockResolvedValue(mockUser);
  //   mockChatService.create.mockResolvedValue(mockChat);
  //   mockChatroomService.getReceivers.mockResolvedValue(['456']);
  //   mockUsersService.getFcmTokensByUserIds.mockResolvedValue(['token1']);
  //
  //   socketClient.io.opts.extraHeaders = {
  //     authorization: 'valid_token',
  //   };
  //
  //   socketClient.connect();
  //
  //   socketClient.on('connect', () => {
  //     socketClient.emit('message', { chatroomId: 'room1', message: 'Hello' });
  //   });
  //
  //   socketClient.on('onMessage', (data) => {
  //     expect(data.message).toBe('메시지 전송에 성공하였습니다');
  //     expect(data.data.message).toBe('Hello');
  //     expect(mockQueue.add).toHaveBeenCalled();
  //     done();
  //   });
  // });
});
