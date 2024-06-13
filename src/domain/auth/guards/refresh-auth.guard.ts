import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserUnauthorizedException } from '@/domain/auth/exceptions/auth.exception';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {
  async canActivate(context: ExecutionContext) {
    try {
      await super.canActivate(context);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UserUnauthorizedException('Refresh token expired.');
      } else {
        throw error;
      }
    }
  }
}
