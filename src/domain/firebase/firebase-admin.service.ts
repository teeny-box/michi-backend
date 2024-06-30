import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseSubscribeException } from '@/domain/firebase/exceptions/firebase.exception';
import { MulticastMessage } from 'firebase-admin/lib/messaging';

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

  async sendPushNotification(multicastMessage: MulticastMessage) {
    return await admin
      .messaging()
      .sendEachForMulticast(multicastMessage)
      .then((response) => {
        console.log('Successfully sent message:', response);
        return { send_message: response };
      })
      .catch((error) => {
        console.error('Error sending message:', error);
        return { error_code: error.code, error_message: error.message };
      });
  }

  async sendGlobalPushNotification(
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message = {
      topic: 'global',
      notification: {
        title,
        body,
      },
      data,
    };

    return await admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.error('Error sending message:', error);
      });
  }

  async subscribeToGlobalTopic(fcmRegistrationToken: string) {
    try {
      await admin.messaging().subscribeToTopic(fcmRegistrationToken, 'global');
      return true;
    } catch (error) {
      console.error('Error subscribing to global topic:', error);
      throw new FirebaseSubscribeException(
        'Failed to subscribe to global topic',
      );
    }
  }

  async unsubscribeFromGlobalTopic(fcmRegistrationToken: string) {
    try {
      await admin
        .messaging()
        .unsubscribeFromTopic(fcmRegistrationToken, 'global');
      return true;
    } catch (error) {
      console.error('Error unsubscribing from global topic:', error);
      return false;
    }
  }
}
