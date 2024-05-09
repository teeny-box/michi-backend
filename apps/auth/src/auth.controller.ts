import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import RequestWithUser from './interfaces/request-with-user.interface';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { HttpResponse } from './@types/http-response';

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
  async login(@Req() req: RequestWithUser, @Res() res: Response) {
    const accessCookie = await this.authService.getCookieWithAccessToken(
      req.user,
    );
    const refreshCookie = await this.authService.getCookieWithRefreshToken(
      req.user,
    );
    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    res.json({
      code: 200,
      message: '로그인 되었습니다.',
      nickname: req.user.nickname,
    });
  }

  @HttpCode(200)
  @Post('/:impUid')
  async getInfoFromPortOne(@Param('impUid') impUid: string) {
    const { name, birthYear, phone } =
      await this.authService.getInfoFromPortOne(impUid);
    return HttpResponse.success('본인인증이 완료되었습니다.', {
      userName: name,
      birthYear,
      phoneNumber: phone,
    });
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response) {
    const { accessCookie, refreshCookie } =
      await this.authService.getCookieForLogout();
    res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    res.json({ code: 200, message: '로그아웃 되었습니다.' });
  }

  @Get('refresh-token')
  @UseGuards(RefreshAuthGuard)
  async refreshToken(@Req() req: RequestWithUser, @Res() res: Response) {
    const accessCookie = await this.authService.getCookieWithAccessToken(
      req.user,
    );
    res.setHeader('Set-Cookie', [accessCookie]);
    res.json({
      code: 200,
      message: '새로운 액세스 토큰이 발급되었습니다.',
    });
  }
}
