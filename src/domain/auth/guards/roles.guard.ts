import { Role } from '@/common/enums/user.enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/role.decorator';
import { UserForbiddenException } from '../exceptions/auth.exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRole) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (user.role !== requiredRole) {
      throw new UserForbiddenException('접근 권한이 없습니다.');
    }

    return true;
  }
}
