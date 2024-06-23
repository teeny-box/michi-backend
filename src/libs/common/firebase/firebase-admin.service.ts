import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { SendNotificationDto } from '@/domain/chat/socket/dto/send-notification.dto';

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

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebase_params),
      });
    }
  }

  async sendPushNotification(
    tokens: string[],
    sendNotificationDto: SendNotificationDto,
  ) {
    const payload = {
      tokens: tokens,
      data: {
        title: sendNotificationDto.title,
        body: sendNotificationDto.body,
      },
    };

    console.log('Sending push notification', payload);

    if (!tokens.length) return;

    return await admin
      .messaging()
      .sendEachForMulticast(payload)
      .then((response) => {
        console.log(response);
        return { sent_message: response };
      })
      .catch((error) => {
        console.error('Firebase error', error);
        return { error_code: error.code, error_message: error.message };
      });
  }
}
