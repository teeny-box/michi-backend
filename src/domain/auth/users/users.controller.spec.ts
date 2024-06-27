import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';
import RequestWithUser from '../interfaces/request-with-user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterFcmTokenDto } from './dto/register-fcm-token.dto';
import { RedisCacheService } from '@/common';
import { HttpResponse } from '@/common/dto/http-response';
import { Role, State } from '@/common/enums/user.enum';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let redisCacheService: RedisCacheService;

  const mockUser: User = {
    _id: new Types.ObjectId(),
    userId: 'testuser',
    password: 'hashedPassword',
    nickname: 'Test User',
    userName: 'Test Name',
    phoneNumber: '010-1234-5678',
    birthYear: '1990',
    profileImage: 'image',
    role: Role.USER,
    state: State.JOINED,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            checkUserId: jest.fn(),
            checkUserIdExists: jest.fn(),
            checkNickname: jest.fn(),
            update: jest.fn(),
            changePassword: jest.fn(),
            remove: jest.fn(),
            registerFcmToken: jest.fn(),
          },
        },
        {
          provide: RedisCacheService,
          useValue: {
            getOnlineUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    redisCacheService = module.get<RedisCacheService>(RedisCacheService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  describe('checkUserId', () => {
    it('should return success message if userId is available', async () => {
      jest.spyOn(usersService, 'checkUserId').mockResolvedValue(undefined);
      const response = await usersController.checkUserId('testUserId');
      expect(response).toEqual(
        HttpResponse.success('사용 가능한 아이디입니다.'),
      );
    });
  });

  describe('checkUserIdExists', () => {
    it('should return success message if userId exists', async () => {
      jest
        .spyOn(usersService, 'checkUserIdExists')
        .mockResolvedValue(undefined);
      const response = await usersController.checkUserIdExists('testUserId');
      expect(response).toEqual(HttpResponse.success('아이디가 존재합니다.'));
    });
  });

  describe('checkNickname', () => {
    it('should return success message if nickname is available', async () => {
      jest.spyOn(usersService, 'checkNickname').mockResolvedValue(undefined);
      const response = await usersController.checkNickname('testNickname');
      expect(response).toEqual(
        HttpResponse.success('사용 가능한 닉네임입니다.'),
      );
    });
  });

  describe('findOne', () => {
    it('should return user information', async () => {
      const mockRequest = { user: mockUser } as RequestWithUser;
      const response = await usersController.findOne(mockRequest);
      expect(response).toEqual(
        HttpResponse.success('회원 정보가 조회되었습니다.', {
          ...mockUser,
          password: undefined,
        }),
      );
    });
  });

  describe('update', () => {
    it('should return updated user information', async () => {
      const mockRequest = { user: mockUser } as RequestWithUser;
      const mockUpdateUserDto: UpdateUserDto = { nickname: 'newNickname' };
      jest
        .spyOn(usersService, 'update')
        .mockResolvedValue({ ...mockUser, ...mockUpdateUserDto });
      const response = await usersController.update(
        mockRequest,
        mockUpdateUserDto,
      );
      expect(response).toEqual(
        HttpResponse.success('회원 정보가 수정되었습니다.', {
          ...mockUser,
          password: undefined,
          nickname: 'newNickname',
        }),
      );
    });
  });

  describe('changePassword', () => {
    it('should return success message if password is changed', async () => {
      const mockRequest = { user: mockUser } as RequestWithUser;
      const mockChangePasswordDto: ChangePasswordDto = {
        newPassword: 'newPassword',
      };
      const response = await usersController.changePassword(
        mockRequest,
        mockChangePasswordDto,
      );
      expect(response).toEqual(
        HttpResponse.success('비밀번호 변경이 완료되었습니다.'),
      );
    });
  });

  describe('remove', () => {
    it('should return success message if user is removed', async () => {
      const mockRequest = { user: mockUser } as RequestWithUser;
      const response = await usersController.remove(mockRequest);
      expect(response).toEqual(
        HttpResponse.success('회원 탈퇴가 완료되었습니다.'),
      );
    });
  });

  describe('getOnlineUsers', () => {
    it('should return list of online users', async () => {
      const mockOnlineUsers = ['user1', 'user2'];
      jest
        .spyOn(redisCacheService, 'getOnlineUsers')
        .mockResolvedValue(mockOnlineUsers);
      const response = await usersController.getOnlineUsers();
      expect(response).toEqual(
        HttpResponse.success(
          '온라인 사용자 목록이 조회되었습니다.',
          mockOnlineUsers,
        ),
      );
    });
  });

  describe('registerFcmToken', () => {
    it('should return success message if FCM token is registered', async () => {
      const mockRequest = { user: mockUser } as RequestWithUser;
      const mockRegisterFcmTokenDto: RegisterFcmTokenDto = {
        token: 'testToken',
      };
      const response = await usersController.registerFcmToken(
        mockRequest,
        mockRegisterFcmTokenDto,
      );
      expect(response).toEqual(
        HttpResponse.success('FCM 토큰 등록이 완료되었습니다.'),
      );
    });
  });
});
