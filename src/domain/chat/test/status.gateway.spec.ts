import { Server, Socket } from 'socket.io';
import { RedisCacheService } from '@/libs/common';
import {
  ChatResponse,
  StatusGateway,
} from '@/domain/chat/socket/status.gateway';
import { UsersService } from '@/domain/auth/users/users.service';
import { ChatroomService } from '@/domain/chat/chatroom/chatroom.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('StatusGateway', () => {
  let gateway: StatusGateway;
  let userService: UsersService;
  let redisCacheService: RedisCacheService;
  let chatroomService: ChatroomService;
  let server: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusGateway,
        {
          provide: UsersService,
          useValue: {
            findByUserIds: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            setUserOnline: jest.fn(),
            addUserToChatQueue: jest.fn(),
            setUserOffline: jest.fn(),
            removeUserFromChatQueue: jest.fn(),
          },
        },
        {
          provide: ChatroomService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<StatusGateway>(StatusGateway);
    userService = module.get<UsersService>(UsersService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
    chatroomService = module.get<ChatroomService>(ChatroomService);
    server = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as any;
    gateway.server = server;
  });

  it('should handle connection', async () => {
    const client = {
      handshake: { query: { userId: '1' } },
    } as unknown as Socket;
    await gateway.handleConnection(client);
    expect(redisCacheService.setUserOnline).toHaveBeenCalledWith('1');
    expect(redisCacheService.addUserToChatQueue).toHaveBeenCalledWith('1');
    expect(server.emit).toHaveBeenCalledWith('userOnline', {
      userId: '1',
      status: 'online',
    });
  });

  it('should handle disconnect', async () => {
    const client = {
      handshake: { query: { userId: '1' } },
    } as unknown as Socket;
    await gateway.handleDisconnect(client);
    expect(redisCacheService.setUserOffline).toHaveBeenCalledWith('1');
    expect(redisCacheService.removeUserFromChatQueue).toHaveBeenCalledWith('1');
    expect(server.emit).toHaveBeenCalledWith('userOffline', {
      userId: '1',
      status: 'offline',
    });
  });

  it('should handle chat response - accept', async () => {
    const client = { id: 'socket1' } as Socket;
    const payload: ChatResponse = {
      sender: 'user1',
      receiver: 'user2',
      response: 'accept',
    };
    await gateway.handleChatResponse(client, payload);
    expect(chatroomService.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: "user1's room" }),
    );
    expect(redisCacheService.removeUserFromChatQueue).toHaveBeenCalledWith(
      'user1',
    );
    expect(redisCacheService.removeUserFromChatQueue).toHaveBeenCalledWith(
      'user2',
    );
    expect(server.to).toHaveBeenCalledWith('user1');
    expect(server.emit).toHaveBeenCalledWith('chatAccepted', {
      userId: 'user2',
    });
  });

  it('should handle chat response - reject', async () => {
    const client = { id: 'socket1' } as Socket;
    const payload: ChatResponse = {
      sender: 'user1',
      receiver: 'user2',
      response: 'reject',
    };
    await gateway.handleChatResponse(client, payload);
    expect(server.to).toHaveBeenCalledWith('user1');
    expect(server.emit).toHaveBeenCalledWith('chatRejected', {
      userId: 'user2',
    });
  });

  it('should send chat request', () => {
    gateway.sendChatRequest('user1', 'user2');
    expect(server.to).toHaveBeenCalledWith('user1');
    expect(server.emit).toHaveBeenCalledWith('chatRequest', {
      receiver: 'user2',
    });
  });
});
