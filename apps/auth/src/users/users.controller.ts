import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch, Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'apps/auth/src/guards/jwt-auth.guard';
import RequestWithUser from 'apps/auth/src/interfaces/request-with-user.interface';
import { HttpResponse } from '@/common/dto/http-response';
import { OneTimeAuthGuard } from 'apps/auth/src/guards/one-time-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import {RedisCacheService} from "@/common";
import {RegisterFcmTokenDto} from "@auth/users/dto/register-fcm-token.dto";

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @Get('/id-check/:userId')
  async checkUserId(@Param('userId') userId: string) {
    await this.usersService.checkUserId(userId);
    return HttpResponse.success('사용 가능한 아이디입니다.');
  }

  @Get('/id-exists/:userId')
  async checkUserIdExists(@Param('userId') userId: string) {
    await this.usersService.checkUserIdExists(userId);
    return HttpResponse.success('아이디가 존재합니다.');
  }

  @Get('/nickname-check/:nickname')
  async checkNickname(@Param('nickname') nickname: string) {
    await this.usersService.checkNickname(nickname);
    return HttpResponse.success('사용 가능한 닉네임입니다.');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findOne(@Req() req: RequestWithUser) {
    req.user.password = undefined;
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
    return HttpResponse.success('회원 정보가 수정되었습니다.', user);
  }

  @Patch('/password')
  @UseGuards(OneTimeAuthGuard)
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      req.user._id,
      changePasswordDto.newPassword,
    );
    return HttpResponse.success('비밀번호 변경이 완료되었습니다.');
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@Req() req: RequestWithUser) {
    await this.usersService.remove(req.user._id);
    return HttpResponse.success('회원 탈퇴가 완료되었습니다.');
  }

  @Get('online')
  @UseGuards(JwtAuthGuard)
  async getOnlineUsers() {
    const onlineUsers = await this.redisCacheService.getOnlineUsers();
    return HttpResponse.success('온라인 사용자 목록이 조회되었습니다.', onlineUsers);
  }

  @Post('/fcm-token')
  @UseGuards(JwtAuthGuard)
  async registerFcmToken(@Req() req: RequestWithUser, @Body() registerFcmTokenDto: RegisterFcmTokenDto) {
    await this.usersService.registerFcmToken(req.user.userId, registerFcmTokenDto.token);
    return HttpResponse.success('FCM 토큰 등록이 완료되었습니다.');
  }
}
