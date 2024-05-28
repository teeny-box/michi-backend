import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterSchema } from './schemas/counter.schema';
import { CounterService } from './counter.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Counter', schema: CounterSchema }]),
  ],
  providers: [CounterService],
  exports: [CounterService],
})
export class CounterModule {}
