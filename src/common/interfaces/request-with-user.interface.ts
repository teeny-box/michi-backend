import { User } from '@/domain/auth/users/schemas/user.schema';
import { Request } from 'express';
interface RequestWithUser extends Request {
  user: User;
}
export default RequestWithUser;
