import { IsNumber, IsString, Max, Min } from 'class-validator';

export class PresignedUrlDto {
  @IsString()
  readonly filename: string;

  @IsNumber()
  @Min(1, { message: 'File size must be greater than 0.' })
  @Max(5 * 1024 * 1024, { message: 'File size cannot exceed 5MB.' })
  readonly fileSize: number;
}
