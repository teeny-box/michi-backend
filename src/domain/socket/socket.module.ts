import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { UsersModule } from '@/domain/auth/users/users.module';
import { UsersService } from '@/domain/auth/users/users.service';
import { RedisModule } from '@songkeys/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersRepository } from '@/domain/auth/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@/domain/auth/users/schemas/user.schema';
import { AuthModule } from '@/domain/auth/auth.module';
import { AuthService } from '@/domain/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ChatModule } from '@/domain/chat/chat.module';
import { NotificationModule } from '@/domain/notification/notification.module';
import { FirebaseAdminModule } from '@/domain/firebase/firebase-admin.module';
import { NotificationProcessor } from '@/domain/notification/notification.processor';
import { FirebaseAdminService } from '@/domain/firebase/firebase-admin.service';
import { RedisConfigService } from '@/config/redis-cache.config';
import { RedisCacheModule } from '@/common';
import { ChatroomModule } from '@/domain/chatroom/chatroom.module';

@Module({
  imports: [
    forwardRef(() => ChatroomModule),
    forwardRef(() => ChatModule),
    UsersModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useClass: RedisConfigService,
      inject: [ConfigService],
    }),
    RedisCacheModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    NotificationModule,
    FirebaseAdminModule,
    AuthModule,
    HttpModule,
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
  providers: [
    SocketGateway,
    UsersService,
    UsersRepository,
    NotificationProcessor,
    FirebaseAdminService,
    AuthService,
  ],
})
export class SocketModule {}
