import { IsString, ValidateNested } from 'class-validator';
import { ClientInfoDto } from '@/domain/device/dto/client-info.dto';
import { Type } from 'class-transformer';

export class CreateUserDeviceDto {
  @ValidateNested()
  @Type(() => ClientInfoDto)
  clientInfo: ClientInfoDto;

  @IsString()
  fcmRegistrationToken: string;
}
