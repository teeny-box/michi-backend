import { Injectable } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { User } from 'apps/auth/src/users/schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import TokenPayload from './interfaces/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import {
  UserForbiddenException,
  UserUnauthorizedException,
  UserWithdrawnException,
} from './exceptions/auth.exception';
import { UserNotFoundException } from 'apps/auth/src/users/exceptions/users.exception';
import * as bcrypt from 'bcrypt';
import { verifyPassword } from './common/utils/password.utils';
import { State } from './@types/enums/user.enum';
import { UsersRepository } from './users/users.repository';
import { AuthVerificationDto } from './users/dto/auth-verification.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
    const { userId, nickname, birthYear } = registrationData;

    await this.usersService.checkUserId(userId);
    await this.usersService.checkNickname(nickname);

    const currentYear = new Date().getFullYear();
    const isUnderage = currentYear - Number(birthYear) < 19;
    if (isUnderage) {
      throw new UserForbiddenException('미성년자는 가입할 수 없습니다.');
    }

    return await this.usersService.create(registrationData);
  }

  // 로그인
  async login(userId: string, password: string): Promise<User> {
    const user = await this.usersService.findById(userId);
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

  // 비밀번호 변경 전 본인인증 정보와 일치여부 확인
  async checkAuthForPassword(
    userId: string,
    authVerificationDto: AuthVerificationDto,
  ): Promise<void> {
    const { userName, phoneNumber, birthYear } = authVerificationDto;
    const user = await this.usersService.findById(userId);

    const isAuthMatch =
      user.userName === userName &&
      user.phoneNumber === phoneNumber &&
      user.birthYear === birthYear;

    if (!isAuthMatch) {
      throw new UserUnauthorizedException(
        '해당 유저의 본인인증 정보와 일치하지 않습니다.',
      );
    }
  }

  // 로그아웃 (빈 값의 쿠키 반환)
  async getCookieForLogout() {
    const accessCookie = `michiAccessToken=; HttpOnly; Path=/; Max-Age=0`;
    const refreshCookie = `michiRefreshToken=; HttpOnly; Path=/; Max-Age=0`;
    return { accessCookie, refreshCookie };
  }

  // access token 생성
  async getAccessToken(user: User) {
    const payload: TokenPayload = {
      userId: user.userId,
      role: user.role,
    };
    return await this.jwtService.signAsync(payload);
  }

  // refresh token 생성
  async getRefreshToken(user: User) {
    const payload: TokenPayload = { userId: user.userId };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION_TIME'),
    });
    await this.usersService.setCurrentRefreshToken(token, user.userId);
    return token;
  }

  // access token 생성, 쿠키 반환
  async getCookieWithAccessToken(user: User) {
    const token = await this.getAccessToken(user);
    return `michiAccessToken=${token}; HttpOnly; SameSite=None; Secure; Max-Age=${process.env.JWT_EXPIRATION_TIME}; Path=/`; // JWT 토큰을 쿠키 형태로 반환
  }

  // refresh token 생성, 쿠키 반환
  async getCookieWithRefreshToken(user: User) {
    const token = await this.getRefreshToken(user);
    return `michiRefreshToken=${token}; HttpOnly; SameSite=None; Secure; Max-Age=${process.env.JWT_REFRESH_EXPIRATION_TIME}; Path=/`;
  }

  // refresh token 검증
  async refreshTokenMatches(refreshToken: string, refreshUserId: string) {
    const user = await this.usersService.findById(refreshUserId);
    // 사용자가 존재하지 않거나 refresh token이 null일 경우 (만료됐을 경우)
    if (!user || !user.currentRefreshToken) {
      throw new UserUnauthorizedException('Refresh token expired.');
    }

    // 유저 DB에 저장된 암호화된 refresh token 값과 받은 refresh token 값 비교
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentRefreshToken,
    );
    // 사용자가 유효한 리프레시 토큰을 제공했지만, 사용자가 저장한 토큰과 일치하지 않을 때 (탈취되었을 위험)
    if (!isRefreshTokenMatching) {
      throw new UserUnauthorizedException('Invalid refresh token.');
    }
    return user;
  }
}
