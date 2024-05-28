import { NestFactory } from '@nestjs/core';
import { ImagesModule } from './images.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from '@/common';

async function bootstrap() {
  const app = await NestFactory.create(ImagesModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter());

  await app.listen(configService.get('PORT'));
}
bootstrap();
