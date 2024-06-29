import { NotificationType } from '@/common/enums/notification-type.enum';
import { PushMessagePriority } from '@/domain/notification/@types/push-message-prirority.type';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  contentAvailable?: boolean;
  priority?: PushMessagePriority;
  deepLink?: string;
  data?: Record<string, string>;
}
