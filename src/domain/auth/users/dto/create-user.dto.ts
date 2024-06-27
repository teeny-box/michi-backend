import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '@/common/enums/user.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{3,19}$/, {
    message:
      'userId는 영문자로 시작하고, 영문자, 숫자, 밑줄(_)로만 이루어져야 합니다. 길이는 4자 이상 20자 이하여야 합니다.',
  })
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'password는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]+$/, {
    message:
      'password는 최소 1개 이상의 영문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10, { message: 'nickname은 10자를 넘을 수 없습니다.' })
  @MinLength(2, { message: 'nickname은 2자 이상이어야 합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣]+$/, {
    message:
      'nickname은 영문자, 숫자, 한글만 허용되며 공백은 허용되지 않습니다.',
  })
  readonly nickname: string;

  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly birthYear: string;

  @IsEnum(Role)
  @IsOptional()
  readonly role?: Role;

  @IsString()
  @IsNotEmpty()
  readonly fcmToken?: string;
}
