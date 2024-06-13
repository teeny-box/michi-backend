import { Expose } from 'class-transformer';
import { Role, State } from '@/domain/auth/@types/enums/user.enum';
import { User } from '../schemas/user.schema';

export class UserResponseDto {
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

  @Expose()
  readonly createdAt: Date;

  @Expose()
  readonly updatedAt: Date;

  @Expose()
  readonly deletedAt?: Date | null;

  constructor(user: User) {
    this.userId = user.userId;
    this.nickname = user.nickname;
    this.profileImage = user.profileImage;
    this.birthYear = user.birthYear;
    this.phoneNumber = user.phoneNumber;
    this.role = user.role;
    this.state = user.state;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.deletedAt = user.deletedAt;
  }
}
