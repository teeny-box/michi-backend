import { NotificationRepository } from '@/domain/notification/notification.repository';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { User } from '@/domain/auth/users/schemas/user.schema';

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto, userId: string) {
    return await this.notificationRepository.find({ userId }, pageOptionsDto);
  }

  async getUnreadCount(user: User) {
    return await this.notificationRepository.countByUserIdAndCreatedAtAfter(
      user.userId,
      user.notificationCheckedAt,
    );
  }
}
