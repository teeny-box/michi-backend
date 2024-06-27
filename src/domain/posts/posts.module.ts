import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemas/post.schema';
import { PostsRepository } from './posts.repository';
import { UsersModule } from '@/domain/auth/users/users.module';
import { UsersService } from '@/domain/auth/users/users.service';
import { UsersRepository } from '@/domain/auth/users/users.repository';
import { UserSchema } from '@/domain/auth/users/schemas/user.schema';
import { DatabaseModule } from '@/database/database.module';
import {
  CounterModule,
  CounterSchema,
  CounterService,
  RedisCacheModule,
} from '@/common';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema },
      { name: 'Counter', schema: CounterSchema },
      { name: 'User', schema: UserSchema },
    ]),
    CounterModule,
    UsersModule,
    RedisCacheModule,
  ],
  controllers: [PostsController],
  providers: [
    PostsService,
    PostsRepository,
    CounterService,
    UsersService,
    UsersRepository,
  ],
})
export class PostsModule {}
