import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseAdminService } from '@/libs/common/firebase/firebase-admin.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
