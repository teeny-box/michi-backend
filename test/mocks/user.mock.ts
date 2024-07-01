import { User } from '@/domain/auth/users/schemas/user.schema';
import { Types } from 'mongoose';
import { Role, State } from '@/common/enums/user.enum';

export const mockUser: User = {
  _id: new Types.ObjectId(),
  userId: 'testuser',
  password: 'hashedPassword',
  nickname: 'Test User',
  userName: 'Test Name',
  phoneNumber: '010-1234-5678',
  birthYear: '1990',
  profileImage: 'image',
  role: Role.USER,
  state: State.JOINED,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: new Date(),
  notificationCheckedAt: new Date(),
};
