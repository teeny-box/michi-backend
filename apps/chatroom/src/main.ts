import { NestFactory } from '@nestjs/core';
import { ChatroomModule } from './chatroom.module';

async function bootstrap() {
  const app = await NestFactory.create(ChatroomModule);
  await app.listen(3000);
}
bootstrap();
