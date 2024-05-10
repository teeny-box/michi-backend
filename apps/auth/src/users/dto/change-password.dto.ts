import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;
}
