import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Post } from './schemas/post.schema';
import { AbstractRepository } from '@/database/abstract.repository';

@Injectable()
export class PostsRepository extends AbstractRepository<Post> {
  protected readonly logger = new Logger(PostsRepository.name);

  constructor(
    @InjectModel(Post.name) postModel: Model<Post>,
    @InjectConnection() connection: Connection,
  ) {
    super(postModel, connection);
  }
}
