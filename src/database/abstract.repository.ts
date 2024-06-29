import { Logger, NotFoundException } from '@nestjs/common';
import {
  Connection,
  FilterQuery,
  Model,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { AbstractDocument } from '@/database/abstract.schema';
import { PageOptionsDto } from '@/common/dto/page/page-options.dto';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(document: Partial<TDocument>, options?: SaveOptions) {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async createMany(documents: Partial<TDocument>[], options?: SaveOptions) {
    return (await this.model.insertMany(
      documents.map((document) => ({
        ...document,
        _id: new Types.ObjectId(),
      })),
      options,
    )) as unknown as TDocument[];
  }

  async findOne(filterQuery: FilterQuery<TDocument>) {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    // if (!document) {
    //   this.logger.warn(
    //     `Document not found with filter: ${JSON.stringify(filterQuery)}`,
    //   );
    //   throw new NotFoundException('Document not found');
    // }

    return document;
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    pageOptions?: PageOptionsDto,
    sortOptions?: Record<string, 1 | -1>,
  ) {
    if (this.model.schema.paths['deletedAt']) {
      filterQuery = {
        ...filterQuery,
        deletedAt: null,
      };
    }

    let resultsQuery = this.model.find(filterQuery, {}, { lean: true });
    const totalQuery = this.model.countDocuments(filterQuery);

    if (sortOptions) {
      resultsQuery = resultsQuery.sort(sortOptions);
    }

    if (pageOptions && pageOptions.page && pageOptions.pageSize) {
      const { pageSize } = pageOptions;
      resultsQuery = resultsQuery.skip(pageOptions.skip).limit(pageSize);
    }

    const results = await resultsQuery.exec();
    const total = await totalQuery.exec();

    return { results, total };
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      new: true,
      lean: true,
    });

    if (!document) {
      this.logger.warn(
        `Document not found with filter: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  /**
   * Upsert a document
   * If the document does not exist, it will be created
   * If the document exists, it will be updated
   */
  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      new: true,
      upsert: true,
      lean: true,
    });
  }
}
