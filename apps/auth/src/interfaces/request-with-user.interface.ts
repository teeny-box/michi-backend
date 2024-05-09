import { User } from 'apps/auth/src/users/schemas/user.schema';
import { Request } from 'express';
interface RequestWithUser extends Request {
  user: User;
}
export default RequestWithUser;
