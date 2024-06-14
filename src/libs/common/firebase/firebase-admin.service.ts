import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseException } from '@/libs/common/firebase/firebase.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseAdminService {
  constructor(private readonly configService: ConfigService) {
    const firebase_params = {
      type: this.configService.get<string>('FIREBASE_TYPE'),
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKeyId: this.configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      clientId: this.configService.get<string>('FIREBASE_CLIENT_ID'),
      authUri: this.configService.get<string>('FIREBASE_AUTH_URI'),
      tokenUri: this.configService.get<string>('FIREBASE_TOKEN_URI'),
      authProviderX509CertUrl: this.configService.get<string>(
        'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
      ),
      clientC509CertUrl: this.configService.get<string>(
        'FIREBASE_CLIENT_X509_CERT_URL',
      ),
    };

    admin.initializeApp({
      credential: admin.credential.cert(firebase_params),
    });
  }

  async sendPushNotification(token: string, title: string, message: string) {
    const payload = {
      token: token,
      data: {
        title: title,
        body: message,
      },
    };

    try {
      return await admin.messaging().send(payload);
    } catch (error) {
      throw new FirebaseException(error.message);
    }
  }
}
