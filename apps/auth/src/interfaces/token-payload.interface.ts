import { Role } from '../@types/enums/user.enum';

interface TokenPayload {
  userId: string;
  role?: Role;
}
export default TokenPayload;
