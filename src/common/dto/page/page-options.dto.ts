import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PageOptionsDto {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1)
  pageSize: number;

  get skip() {
    return (this.page - 1) * this.pageSize;
  }

  constructor(page = 1, pageSize = 10) {
    this.page = page;
    this.pageSize = pageSize;
  }
}
