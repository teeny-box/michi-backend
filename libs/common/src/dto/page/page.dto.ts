import {IsArray} from "class-validator";
import {Type} from "class-transformer";
import {PageMetaDto} from "@/common/dto/page/page-meta.dto";

export class PageDto<T> {
    @IsArray()
    readonly data: T[];

    @Type(() => PageMetaDto)
    readonly meta: PageMetaDto;

    constructor(data: T[], meta: PageMetaDto) {
        this.data = data;
        this.meta = meta;
    }
}