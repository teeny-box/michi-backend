import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ImagesController],
  providers: [],
})
export class ImagesModule {}
