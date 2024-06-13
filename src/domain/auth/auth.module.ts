import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule, RedisCacheService } from '@/libs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@/domain/auth/users/schemas/user.schema';
import { HttpModule } from '@nestjs/axios';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { OneTimeStrategy } from './strategies/one-time.strategy';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    HttpModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    OneTimeStrategy,
    UsersService,
    UsersRepository,
    RedisCacheService,
  ],
})
export class AuthModule {}
