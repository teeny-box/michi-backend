import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './users/schemas/user.schema';
import { Role, State } from './@types/enums/user.enum';
import { CreateUserDto } from './users/dto/create-user.dto';
import { HttpResponse } from '@/libs/common/dto/http-response';
import { AuthVerificationDto } from './users/dto/auth-verification.dto';
import { CheckForPasswordDto } from './users/dto/check-for-password.dto';
import { Types } from 'mongoose';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(mockUser),
            getAccessToken: jest.fn().mockResolvedValue('accessToken'),
            getRefreshToken: jest.fn().mockResolvedValue('refreshToken'),
            findUserIdByAuth: jest.fn().mockResolvedValue('testuser'),
            checkAuthForPassword: jest.fn().mockResolvedValue('oneTimeToken'),
            logout: jest.fn().mockResolvedValue(true),
            getInfoFromPortOne: jest.fn().mockResolvedValue({
              name: 'Test Name',
              birthYear: '1990',
              phone: '010-1234-5678',
            }),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a user', async () => {
      const createUserDto: CreateUserDto = {
        userId: 'testuser',
        nickname: 'Test User',
        userName: 'Test Name',
        phoneNumber: '010-1234-5678',
        birthYear: '1990',
        password: 'password123',
      };
      const result = await authController.register(createUserDto);
      expect(result).toEqual(
        HttpResponse.created('회원가입이 완료되었습니다.', 'Test User'),
      );
    });
  });

  describe('login', () => {
    it('should login a user', async () => {
      const req = { user: mockUser };
      const result = await authController.login(req as any);
      expect(result).toEqual(
        HttpResponse.success('로그인 되었습니다.', {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        }),
      );
    });
  });

  describe('findUserIdByAuth', () => {
    it('should find user id by auth', async () => {
      const authVerificationDto: AuthVerificationDto = {
        userName: 'Test Name',
        phoneNumber: '010-1234-5678',
        birthYear: '1990',
      };
      const result = await authController.findUserIdByAuth(authVerificationDto);
      expect(result).toEqual(
        HttpResponse.success('아이디를 찾았습니다.', 'testuser'),
      );
    });
  });

  describe('checkAuthForPassword', () => {
    it('should check auth for password', async () => {
      const checkForPasswordDto: CheckForPasswordDto = {
        impUid: 'imp_uid',
        userId: 'testuser',
      };
      const res = {
        setHeader: jest.fn(),
        json: jest.fn(),
      };
      await authController.checkAuthForPassword(
        checkForPasswordDto,
        res as any,
      );
      expect(res.setHeader).toHaveBeenCalledWith(
        'Authorization',
        'Bearer oneTimeToken',
      );
      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '비밀번호 변경이 가능합니다.',
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token', async () => {
      const req = { user: mockUser };
      const result = await authController.refreshToken(req as any);
      expect(result).toEqual(
        HttpResponse.success('새로운 액세스 토큰이 발급되었습니다.', {
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        }),
      );
    });
  });

  describe('logout', () => {
    it('should logout a user', async () => {
      const req = { user: mockUser };
      const result = await authController.logout(req as any);
      expect(result).toEqual(HttpResponse.success('로그아웃 되었습니다.'));
    });
  });

  describe('getInfoFromPortOne', () => {
    it('should get info from PortOne', async () => {
      const impUid = 'imp_uid';
      const result = await authController.getInfoFromPortOne(impUid);
      expect(result).toEqual(
        HttpResponse.success('본인인증이 완료되었습니다.', {
          userName: 'Test Name',
          birthYear: '1990',
          phoneNumber: '010-1234-5678',
        }),
      );
    });
  });
});
