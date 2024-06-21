import { Role } from '@/domain/auth/@types/enums/user.enum';
import { Types } from 'mongoose';

interface TokenPayload {
  _id: Types.ObjectId;
  role?: Role;
}
export default TokenPayload;
