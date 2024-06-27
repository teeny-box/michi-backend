import { Injectable } from '@nestjs/common';
import { Counter } from './schemas/counter.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CounterService {
  constructor(
    @InjectModel(Counter.name) private counterModel: Model<Counter>,
  ) {}

  async getNextSequenceValue(sequenceName: string): Promise<number> {
    const sequenceDocument = await this.counterModel.findOneAndUpdate(
      { name: sequenceName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, lean: true },
    );
    return sequenceDocument.seq;
  }
}
