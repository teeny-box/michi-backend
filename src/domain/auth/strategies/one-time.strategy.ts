import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import TokenPayload from '@/common/interfaces/token-payload.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class OneTimeStrategy extends PassportStrategy(Strategy, 'one-time') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ONETIME_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: TokenPayload) {
    const user = await this.usersService.findById(payload._id);
    req.user = user;
    return user;
  }
}
