import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@/database/abstract.repository';
import { Notification } from '@/domain/notification/schemas/notification.schema';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

@Injectable()
export class NotificationRepository extends AbstractRepository<Notification> {
  protected readonly logger = new Logger(NotificationRepository.name);

  constructor(
    @InjectModel(Notification.name) notificationModel: Model<Notification>,
    @InjectConnection() connection: Connection,
  ) {
    super(notificationModel, connection);
  }

  async countByUserIdAndCreatedAtAfter(userId: string, createdAt: Date) {
    return this.model.countDocuments({
      userId,
      createdAt: { $gt: createdAt },
    });
  }
}
