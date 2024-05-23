import { UserUnauthorizedException } from '@auth/exceptions/auth.exception';
import * as bcrypt from 'bcrypt';

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// 비밀번호 비교
export async function verifyPassword(
  userInputPassword: string,
  hashedPassword: string,
): Promise<void> {
  const isMatchPassword = await bcrypt.compare(
    userInputPassword,
    hashedPassword,
  );
  if (!isMatchPassword) {
    throw new UserUnauthorizedException('비밀번호가 일치하지 않습니다.');
  }
}
