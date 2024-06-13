import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsString()
  @IsOptional()
  readonly newPassword?: string;

  @IsString()
  @IsOptional()
  readonly nickname?: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsString()
  @IsOptional()
  readonly profileImage?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  readonly imageUrlsToDelete?: string[];
}
