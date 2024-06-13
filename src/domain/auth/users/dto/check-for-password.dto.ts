import { IsNotEmpty, IsString } from 'class-validator';

export class CheckForPasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly impUid: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}
