import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'apps/auth/src/guards/jwt-auth.guard';
import RequestWithUser from 'apps/auth/src/interfaces/request-with-user.interface';
import { HttpResponse } from '../@types/http-response';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/nickname-check/:nickname')
  async checkNickname(@Param('nickname') nickname: string) {
    const result = await this.usersService.checkNickname(nickname);
    return HttpResponse.success('닉네임 사용 가능 여부', {
      available: result,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: RequestWithUser) {
    req.user.password = undefined;
    req.user.currentRefreshToken = undefined;
    return HttpResponse.success('회원 정보가 조회되었습니다.', req.user);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(req.user, updateUserDto);
    user.password = undefined;
    user.currentRefreshToken = undefined;
    return HttpResponse.success('회원 정보가 수정되었습니다.', user);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: RequestWithUser, @Res() res: Response) {
    await this.usersService.remove(req.user.userId);
    res.clearCookie('michiAccessToken', { path: '/' });
    res.clearCookie('michiRefreshToken', { path: '/' });
    res.json({ code: 200, message: '회원 탈퇴가 완료되었습니다.' });
  }
}
