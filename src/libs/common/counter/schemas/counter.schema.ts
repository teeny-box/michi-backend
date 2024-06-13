import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@/libs/common';

@Schema({ collection: 'counters' })
export class Counter extends AbstractDocument {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: Number, required: true, default: 0 })
  seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
