import { Types } from 'mongoose';
import { Role } from '@/common/enums/user.enum';

interface TokenPayload {
  _id: Types.ObjectId;
  role?: Role;
}
export default TokenPayload;
