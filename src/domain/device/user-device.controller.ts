import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDeviceDto } from '@/domain/device/dto/create-user-device.dto';
import { UserDeviceService } from '@/domain/device/user-device.service';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import RequestWithUser from '@/domain/auth/interfaces/request-with-user.interface';
import { HttpResponse } from '@/common/dto/http-response';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class UserDeviceController {
  constructor(private readonly userDeviceService: UserDeviceService) {}

  @Get()
  async getUserDevices(@Req() req: RequestWithUser) {
    const { results } = await this.userDeviceService.getUserDevices(
      req.user.userId,
    );
    return HttpResponse.success(`조회가 완료되었습니다.`, results);
  }

  @Post()
  async createOrUpdateUserDevice(
    @Req() req: RequestWithUser,
    @Body() createUserDeviceDto: CreateUserDeviceDto,
  ) {
    await this.userDeviceService.createOrUpdateUserDevice(
      req.user.userId,
      createUserDeviceDto,
    );
    return HttpResponse.success(`등록이 완료되었습니다.`);
  }

  @Delete(':fcmRegistrationToken')
  async removeUserDevice(
    @Req() req: RequestWithUser,
    @Param('fcmRegistrationToken') fcmRegistrationToken: string,
  ) {
    await this.userDeviceService.removeUserDevice(
      req.user.userId,
      fcmRegistrationToken,
    );
    return HttpResponse.success(`삭제가 완료되었습니다.`);
  }
}
