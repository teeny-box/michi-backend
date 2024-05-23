import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly page: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  readonly pageSize: number;

  get skip() {
    return (this.page - 1) * this.pageSize;
  }
}
