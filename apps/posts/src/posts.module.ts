import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import {
  CounterModule,
  CounterSchema,
  CounterService,
  DatabaseModule,
  RedisCacheModule,
  RedisConfigService,
} from '@/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemas/post.schema';
import { RedisModule } from '@songkeys/nestjs-redis';
import { PostsRepository } from './posts.repository';
import { JwtStrategy } from '@auth/strategies/jwt.strategy';
import { UsersModule } from '@auth/users/users.module';
import { UsersService } from '@auth/users/users.service';
import { UsersRepository } from '@auth/users/users.repository';
import { UserSchema } from '@auth/users/schemas/user.schema';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/posts/.env',
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Counter', schema: CounterSchema },
      { name: 'User', schema: UserSchema },
    ]),
    CounterModule,
    UsersModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    RedisCacheModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    CounterService,
    JwtStrategy,
    JwtAuthGuard,
    UsersService,
    UsersRepository,
  ],
})
export class PostsModule {}
