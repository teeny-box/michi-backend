import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserBadRequestException,
  UserNotFoundException,
} from './exceptions/users.exception';
import { hashPassword, verifyPassword } from '../common/utils/password.utils';
import { State } from '../@types/enums/user.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  // 아이디 사용 가능 여부
  async checkUserId(userId: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ userId });
    if (existingUser) {
      throw new UserBadRequestException('존재하는 ID입니다.');
    }
  }

  // 아이디 존재 여부 체크
  async checkUserIdExists(userId: string): Promise<void> {
    await this.findById(userId);
  }

  // 닉네임 사용 가능 여부
  async checkNickname(nickname: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ nickname });
    if (existingUser) {
      throw new UserBadRequestException('존재하는 닉네임입니다.');
    }
  }

  // 회원 생성
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(createUserDto.password);
    return await this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  // userId로 회원 정보 조회
  async findById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ userId });
    if (!user) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // 회원 정보 수정
  async update(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.newPassword) {
      if (!updateUserDto.password) {
        throw new UserBadRequestException('비밀번호를 입력해야 합니다.');
      }
      await verifyPassword(updateUserDto.password, user.password);

      const hashedPassword = await hashPassword(updateUserDto.newPassword);

      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { userId: user.userId },
        { ...updateUserDto, password: hashedPassword },
      );
      return updatedUser;
    }

    return await this.usersRepository.findOneAndUpdate(
      { userId: user.userId },
      updateUserDto,
    );
  }

  // 비밀번호 변경
  async changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    const { userId, newPassword } = changePasswordDto;

    await this.findById(userId);
    const hashedPassword = await hashPassword(newPassword);

    await this.usersRepository.findOneAndUpdate(
      { userId },
      { password: hashedPassword },
    );
  }

  // 회원 탈퇴
  async remove(userId: string): Promise<void> {
    await this.usersRepository.findOneAndUpdate(
      { userId },
      { state: State.WITHDRAWN, deletedAt: new Date() },
    );
  }

  // refresh token 저장
  async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    const currentRefreshToken =
      await this.getCurrentHashedRefreshToken(refreshToken);
    await this.usersRepository.findOneAndUpdate(
      { userId },
      { currentRefreshToken },
    );
  }

  async getCurrentHashedRefreshToken(refreshToken: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(refreshToken, salt);
  }
}
