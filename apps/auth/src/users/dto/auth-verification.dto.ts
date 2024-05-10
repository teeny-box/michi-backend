import { IsNotEmpty, IsString } from 'class-validator';

export class AuthVerificationDto {
  @IsString()
  @IsNotEmpty()
  readonly userName: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly birthYear: string;
}
