import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserUnauthorizedException } from '@/domain/auth/exceptions/auth.exception';

@Injectable()
export class OneTimeAuthGuard extends AuthGuard('one-time') {
  async canActivate(context: ExecutionContext) {
    try {
      await super.canActivate(context);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UserUnauthorizedException('One time token expired.');
      } else {
        throw error;
      }
    }
  }
}
