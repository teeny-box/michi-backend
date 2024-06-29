import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from '@/domain/notification/notification.service';
import { JwtAuthGuard } from '@/domain/auth/guards/jwt-auth.guard';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import RequestWithUser from '@/domain/auth/interfaces/request-with-user.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Req() req: RequestWithUser,
    @Query() pageOptionsDto: PageOptionsDto,
  ) {
    return await this.notificationService.findAll(
      pageOptionsDto,
      req.user.userId,
    );
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Req() req: RequestWithUser) {
    return await this.notificationService.getUnreadCount(req.user);
  }
}
