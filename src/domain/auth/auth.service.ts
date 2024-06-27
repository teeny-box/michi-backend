import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { User } from '@/domain/auth/users/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './interfaces/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import {
  InvalidTokenException,
  UserConflictException,
  UserForbiddenException,
  UserUnauthorizedException,
  UserWithdrawnException,
} from './exceptions/auth.exception';
import { UserNotFoundException } from '@/domain/auth/exceptions/users.exception';
import { verifyPassword } from './common/utils/password.utils';
import { State } from './@types/enums/user.enum';
import { UsersRepository } from './users/users.repository';
import { AuthVerificationDto } from './users/dto/auth-verification.dto';
import { RedisCacheService } from '@/libs/common';
import * as argon2 from 'argon2';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  // 포트원 -> 출생년도, 폰번호 가져오기
  async getInfoFromPortOne(
    impUid: string,
  ): Promise<{ name: string; birthYear: string; phone: string }> {
    // 인증 토큰 발급 받기
    const getTokenRequest = this.httpService
      .post(
        'https://api.iamport.kr/users/getToken',
        {
          imp_key: process.env.PORTONE_REST_API_KEY,
          imp_secret: process.env.PORTONE_REST_API_SECRET,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      .pipe(map((res) => res.data?.response.access_token))
      .pipe(
        catchError(() => {
          throw new UserUnauthorizedException(
            '본인인증에 실패했습니다. 토큰을 가져오지 못했습니다.',
          );
        }),
      );
    const accessToken = await lastValueFrom(getTokenRequest);

    // imp_uid로 인증 정보 조회
    const getCertificationsRequest = this.httpService
      .get(`https://api.iamport.kr/certifications/${impUid}`, {
        headers: { Authorization: accessToken },
      })
      .pipe(
        map((res) => ({
          name: res.data?.response.name,
          birthday: res.data?.response.birthday,
          phone: res.data?.response.phone,
        })),
      )
      .pipe(
        catchError(() => {
          throw new UserUnauthorizedException(
            '본인인증에 실패했습니다. 유저 정보를 찾을 수 없습니다.',
          );
        }),
      );
    const { name, birthday, phone } = await lastValueFrom(
      getCertificationsRequest,
    );
    const birthYear = birthday.substring(0, 4);

    return { name, birthYear, phone };
  }

  // 회원가입
  async register(registrationData: CreateUserDto): Promise<User> {
    const { userId, nickname, userName, phoneNumber, birthYear } =
      registrationData;

    await this.usersService.checkUserId(userId);
    await this.usersService.checkNickname(nickname);

    const user = await this.usersRepository.findOne({
      userName,
      phoneNumber,
      birthYear,
    });
    if (user) {
      throw new UserConflictException('이미 존재하는 사용자입니다.');
    }

    const currentYear = new Date().getFullYear();
    const isUnderage = currentYear - Number(birthYear) < 19;
    if (isUnderage) {
      throw new UserForbiddenException('미성년자는 가입할 수 없습니다.');
    }

    return await this.usersService.create(registrationData);
  }

  // 로그인
  async login(userId: string, password: string): Promise<User> {
    const user = await this.usersService.findByUserId(userId);
    if (user.state === State.WITHDRAWN) {
      throw new UserWithdrawnException('탈퇴한 회원입니다.');
    }

    await verifyPassword(password, user.password);

    return user;
  }

  // 아이디 찾기
  async findUserIdByAuth(
    authVerificationDto: AuthVerificationDto,
  ): Promise<string> {
    const { userName, phoneNumber, birthYear } = authVerificationDto;

    const user = await this.usersRepository.findOne({
      userName,
      phoneNumber,
      birthYear,
    });
    if (!user) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user.userId;
  }

  // 비밀번호 변경 전 포트원에서 본인인증 정보 가져온 후 회원정보와 일치여부 확인 (일치하면 일회용 토큰 발급)
  async checkAuthForPassword(impUid: string, userId: string): Promise<string> {
    const user = await this.usersService.findByUserId(userId);
    const { name, birthYear, phone } = await this.getInfoFromPortOne(impUid);

    const isAuthMatch =
      user.userName === name &&
      user.phoneNumber === phone &&
      user.birthYear === birthYear;
    if (!isAuthMatch) {
      throw new UserUnauthorizedException(
        '해당 유저의 본인인증 정보와 일치하지 않습니다.',
      );
    }

    const token = await this.getOneTimeToken(user);

    return token;
  }

  // 로그아웃 (db에서 리프레시토큰 삭제)
  async logout(_id: Types.ObjectId): Promise<void> {
    await this.redisCacheService.del(_id.toString());
  }

  // access token 생성
  async getAccessToken(user: User) {
    const payload: TokenPayload = {
      _id: user._id,
      role: user.role,
    };
    return await this.jwtService.signAsync(payload);
  }

  // refresh token 생성 (db에 저장)
  async getRefreshToken(user: User) {
    const payload: TokenPayload = { _id: user._id };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });

    const hashedRefreshToken = await argon2.hash(token);
    await this.redisCacheService.set(
      user._id.toString(),
      hashedRefreshToken,
      this.configService.get<number>('JWT_REFRESH_EXPIRATION_TIME') / 1000,
    );

    return token;
  }

  // 일회용 토큰 생성
  async getOneTimeToken(user: User) {
    const payload: TokenPayload = { _id: user._id };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ONETIME_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ONETIME_EXPIRATION_TIME'),
    });

    return token;
  }

  // 만료된 access token이 맞는지 검증
  async isAccessTokenExpired(accessToken: string): Promise<boolean> {
    try {
      await this.jwtService.verifyAsync(accessToken);
      return false;
    } catch (e) {
      return true;
    }
  }

  // refresh token 검증
  async refreshTokenMatches(refreshToken: string, _id: Types.ObjectId) {
    const user = await this.usersService.findById(_id);

    const currentRefreshToken = await this.redisCacheService.get(
      _id.toString(),
    );
    // db에 리프레시 토큰이 없을 경우 (만료)
    if (!currentRefreshToken) {
      throw new UserUnauthorizedException('Refresh token expired.');
    }
    // db에 저장된 refresh token 값과 받은 refresh token 값 비교
    const isRefreshTokenMatching = await argon2.verify(
      currentRefreshToken,
      refreshToken,
    );
    // 사용자가 유효한 리프레시 토큰을 제공했지만, db에 저장된 토큰과 일치하지 않을 때 (탈취되었을 위험)
    if (!isRefreshTokenMatching) {
      await this.redisCacheService.del(_id.toString());
      throw new InvalidTokenException('Invalid refresh token.');
    }

    return user;
  }

  async getUserByToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return await this.usersService.findById(payload._id);
    } catch (e) {
      throw new UserUnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }
}
