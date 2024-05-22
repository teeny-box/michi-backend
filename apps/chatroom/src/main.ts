import { NestFactory } from '@nestjs/core';
import { ChatroomModule } from './chatroom.module';
import {ConfigService} from "@nestjs/config";
import {Logger, ValidationPipe} from "@nestjs/common";
import {AllExceptionFilter} from "@/common";

async function bootstrap() {
  const app = await NestFactory.create(ChatroomModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const logger = new Logger('ChatroomModule')

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

  await app.listen(PORT);
  logger.log(`Server is running on port ${PORT}`)
}
bootstrap();
