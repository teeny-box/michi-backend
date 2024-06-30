import { Post } from '@/domain/posts/schemas/post.schema';
import { Types } from 'mongoose';

export const mockPost: Post = {
  _id: new Types.ObjectId(),
  postNumber: 1,
  userId: 'mockUserId',
  title: 'Test Post',
  content: 'This is a test post.',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};
