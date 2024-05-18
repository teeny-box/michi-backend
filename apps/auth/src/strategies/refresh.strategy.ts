import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import TokenPayload from '../interfaces/token-payload.interface';
import { AuthService } from '../auth.service';
import { NotExpiredAccessTokenException } from '../exceptions/auth.exception';
import { UsersService } from '../users/users.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }
  async validate(req: Request, payload: TokenPayload) {
    const expiredAccessToken = req.body.accessToken;
    const isAccessTokenExpired =
      await this.authService.isAccessTokenExpired(expiredAccessToken);
    if (!isAccessTokenExpired) {
      await this.usersService.clearCurrentRefreshToken(payload._id);
      throw new NotExpiredAccessTokenException(
        'This is not an expired access token.',
      );
    }
    const refreshToken = req.headers.authorization.split(' ')[1];
    return await this.authService.refreshTokenMatches(
      refreshToken,
      payload._id,
    );
  }
}
