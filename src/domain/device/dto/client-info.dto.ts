import { IsEnum, IsString, IsOptional } from 'class-validator';
import { OsType } from '@/common/enums/os-type.enum';
import { AppType } from '@/common/enums/app-type.enum';

export class ClientInfoDto {
  @IsEnum(OsType)
  osType: OsType;

  @IsString()
  @IsOptional()
  osVersion?: string;

  @IsEnum(AppType)
  @IsOptional()
  appType?: AppType;

  @IsString()
  @IsOptional()
  appVersion?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  deviceModel?: string;
}
