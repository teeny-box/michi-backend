import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './interfaces/request-with-user.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { HttpResponse } from './@types/http-response';
import { AuthVerificationDto } from './users/dto/auth-verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    return HttpResponse.created('회원가입이 완료되었습니다.', user.nickname);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: RequestWithUser) {
    const accessToken = await this.authService.getAccessToken(req.user);
    const refreshToken = await this.authService.getRefreshToken(req.user);
    return HttpResponse.success('로그인 되었습니다.', {
      accessToken,
      refreshToken,
    });
  }

  @HttpCode(200)
  @Post('/verification')
  async findUserIdByAuth(@Body() authVerificationDto: AuthVerificationDto) {
    const userId = await this.authService.findUserIdByAuth(authVerificationDto);
    return HttpResponse.success('아이디를 찾았습니다.', userId);
  }

  @HttpCode(200)
  @Post('/verification/:userId')
  async checkAuthForPassword(
    @Param('userId') userId: string,
    @Body() authVerificationDto: AuthVerificationDto,
  ) {
    await this.authService.checkAuthForPassword(userId, authVerificationDto);
    return HttpResponse.success('비밀번호 변경이 가능합니다.');
  }

  @HttpCode(200)
  @Post('/refresh-token')
  @UseGuards(RefreshAuthGuard)
  async refreshToken(@Req() req: RequestWithUser) {
    const accessToken = await this.authService.getAccessToken(req.user);
    const refreshToken = await this.authService.getRefreshToken(req.user);
    return HttpResponse.success('새로운 액세스 토큰이 발급되었습니다.', {
      accessToken,
      refreshToken,
    });
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: RequestWithUser) {
    await this.authService.logout(req.user.userId);
    return HttpResponse.success('로그아웃 되었습니다.');
  }

  @Get('/:impUid')
  async getInfoFromPortOne(@Param('impUid') impUid: string) {
    const { name, birthYear, phone } =
      await this.authService.getInfoFromPortOne(impUid);
    return HttpResponse.success('본인인증이 완료되었습니다.', {
      userName: name,
      birthYear,
      phoneNumber: phone,
    });
  }
}
