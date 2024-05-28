import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        AWS_REGION: Joi.string().required(),
        AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
        AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
      }),
      envFilePath: './apps/images/.env',
    }),
  ],
  controllers: [ImagesController],
  providers: [],
})
export class ImagesModule {}
