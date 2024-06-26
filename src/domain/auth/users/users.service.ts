import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserBadRequestException,
  UserIdDuplicateException,
  UserNicknameDuplicateException,
  UserNotFoundException,
} from '@/domain/auth/exceptions/users.exception';
import { hashPassword, verifyPassword } from '@/common/utils/password.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Types } from 'mongoose';
import { RedisCacheService } from '@/common';
import { deleteFiles } from '@/common/utils/s3.utils';
import { State } from '@/common/enums/user.enum';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisCacheService: RedisCacheService,
    private readonly configService: ConfigService,
  ) {}

  // 아이디 사용 가능 여부
  async checkUserId(userId: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ userId });
    if (existingUser) {
      throw new UserIdDuplicateException('존재하는 ID입니다.');
    }
  }

  // 아이디 존재 여부 체크
  async checkUserIdExists(userId: string): Promise<void> {
    await this.findByUserId(userId);
  }

  // 닉네임 사용 가능 여부
  async checkNickname(nickname: string): Promise<void> {
    const existingUser = await this.usersRepository.findOne({ nickname });
    if (existingUser) {
      throw new UserNicknameDuplicateException('존재하는 닉네임입니다.');
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

  // 모든 회원 조회
  async findAll(pageOptionsDto?: PageOptionsDto) {
    const { results, total } = await this.usersRepository.find(
      {},
      pageOptionsDto,
      { createdAt: -1 },
    );

    const users = await Promise.all(
      results.map(async (user) => {
        return new UserResponseDto(user);
      }),
    );

    return { users, total };
  }

  // _id로 회원 정보 조회
  async findById(_id: Types.ObjectId): Promise<User> {
    const user = await this.usersRepository.findOne({ _id });
    if (!user) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // userId로 회원 정보 조회
  async findByUserId(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ userId });
    if (!user) {
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  // userIds로 회원 정보 조회
  async findByUserIds(userIds: string[]): Promise<User[]> {
    const { results } = await this.usersRepository.find({
      userId: { $in: userIds },
    });
    return results;
  }

  // 회원 정보 수정
  async update(user: User, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.imageUrlsToDelete) {
      await deleteFiles(this.configService, updateUserDto.imageUrlsToDelete);
    }

    if (updateUserDto.newPassword) {
      if (!updateUserDto.password) {
        throw new UserBadRequestException('비밀번호를 입력해야 합니다.');
      }
      await verifyPassword(updateUserDto.password, user.password);

      const hashedPassword = await hashPassword(updateUserDto.newPassword);

      const updatedUser = await this.usersRepository.findOneAndUpdate(
        { _id: user._id },
        { ...updateUserDto, password: hashedPassword },
      );
      return updatedUser;
    }

    return await this.usersRepository.findOneAndUpdate(
      { _id: user._id },
      updateUserDto,
    );
  }

  // 비밀번호 변경
  async changePassword(
    _id: Types.ObjectId,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await hashPassword(newPassword);

    await this.usersRepository.findOneAndUpdate(
      { _id },
      { password: hashedPassword },
    );
  }

  // 회원 탈퇴
  async remove(_id: Types.ObjectId): Promise<void> {
    await this.usersRepository.findOneAndUpdate(
      { _id },
      {
        state: State.WITHDRAWN,
        deletedAt: new Date(),
      },
    );
    await this.redisCacheService.del(_id.toString());
  }
}
