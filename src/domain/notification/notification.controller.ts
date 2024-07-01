import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from '@/domain/notification/notification.service';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import RequestWithUser from '@/common/interfaces/request-with-user.interface';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { HttpResponse } from '@/common/dto/http-response';
import { SendNotificationDto } from '@/domain/notification/dto/send-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  async findAll(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    const { results, total } = await this.notificationService.findAll(
      pageOptionsDto,
      req.user.userId,
    );

    const { data, meta } = new PageDto(
      results,
      new PageMetaDto(pageOptionsDto, total),
    );

    return HttpResponse.success(`조회가 완료되었습니다.`, data, meta);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: RequestWithUser) {
    const result = await this.notificationService.getUnreadCount(req.user);
    return HttpResponse.success(`조회가 완료되었습니다.`, result);
  }

  @Post('global')
  async sendGlobalNotification(
    @Req() req: RequestWithUser,
    @Body() payload: SendNotificationDto,
  ) {
    await this.notificationService.sendGlobalNotification(payload);
    return HttpResponse.success(`전체 공지 전송이 완료되었습니다.`);
  }
}
