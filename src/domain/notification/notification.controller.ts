import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from '@/domain/notification/notification.service';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import RequestWithUser from '@/domain/auth/interfaces/request-with-user.interface';
import { PageMetaDto } from '@/common/dto/page/page-meta.dto';
import { PageDto } from '@/common/dto/page/page.dto';
import { HttpResponse } from '@/common/dto/http-response';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: RequestWithUser) {
    const result = await this.notificationService.getUnreadCount(req.user);
    return HttpResponse.success(`조회가 완료되었습니다.`, result);
  }
}
