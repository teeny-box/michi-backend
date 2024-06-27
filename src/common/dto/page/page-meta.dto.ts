import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

export class PageMetaDto {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly pageCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;

  constructor(pageOptionsDto: PageOptionsDto, total: number) {
    this.page = pageOptionsDto.page;
    this.pageSize = pageOptionsDto.pageSize;
    this.total = total;
    this.pageCount = Math.ceil(this.total / this.pageSize);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}
