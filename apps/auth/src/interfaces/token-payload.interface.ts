import { ObjectId } from 'mongodb';
import { Role } from '../@types/enums/user.enum';

interface TokenPayload {
  _id: ObjectId;
  role?: Role;
}
export default TokenPayload;
