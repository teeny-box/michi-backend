import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { RedisModule } from '@songkeys/nestjs-redis';
import { AuthModule } from './domain/auth/auth.module';
import { UsersModule } from './domain/auth/users/users.module';
import { ChatModule } from './domain/chat/chat.module';
import { ImagesModule } from './domain/images/images.module';
import { PostsModule } from './domain/posts/posts.module';
import { DatabaseModule } from '@/database/database.module';
import { RedisConfigService } from '@/config/redis-cache.config';
import { RedisCacheModule } from '@/common';
import { NotificationModule } from '@/domain/notification/notification.module';
import { FirebaseAdminModule } from '@/domain/firebase/firebase-admin.module';
import { ChatroomModule } from '@/domain/chatroom/chatroom.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_EXPIRATION_TIME: Joi.string().required(),
        JWT_ONETIME_SECRET: Joi.string().required(),
        JWT_ONETIME_EXPIRATION_TIME: Joi.string().required(),
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    RedisCacheModule,
    AuthModule,
    UsersModule,
    ChatModule,
    ChatroomModule,
    ImagesModule,
    PostsModule,
    NotificationModule,
    FirebaseAdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
