import { IsArray, IsString } from 'class-validator';

export class DeleteFilesDto {
  @IsArray()
  @IsString({ each: true })
  keys: string[];
}
