import { Expose } from 'class-transformer';
import { Role, State } from '@/common/enums/user.enum';
import { User } from '@/domain/auth/users/schemas/user.schema';

export class SocketUserResponseDto {
  @Expose()
  readonly userId: string;

  @Expose()
  readonly nickname: string;

  @Expose()
  readonly profileImage: string;

  @Expose()
  readonly birthYear: string;

  @Expose()
  readonly phoneNumber: string;

  @Expose()
  readonly role: Role;

  @Expose()
  readonly state: State;

  readonly isOnline: boolean;

  @Expose()
  readonly createdAt: Date;

  @Expose()
  readonly updatedAt: Date;

  @Expose()
  readonly deletedAt?: Date | null;

  constructor(user: User, isOnline: boolean) {
    this.userId = user.userId;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
    this.birthYear = user.birthYear;
    this.phoneNumber = user.phoneNumber;
    this.role = user.role;
    this.state = user.state;
    this.isOnline = isOnline;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.deletedAt = user.deletedAt;
  }
}
