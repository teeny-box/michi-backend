import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
// eslint-disable-next-line
// @ts-ignore
import * as firebaseConfig from '@/libs/common/firebase/firebase.config.json';
import { FirebaseException } from '@/libs/common/firebase/firebase.exception';

const firebase_params = {
  type: firebaseConfig.type,
  projectId: firebaseConfig.project_id,
  privateKeyId: firebaseConfig.private_key_id,
  privateKey: firebaseConfig.private_key,
  clientEmail: firebaseConfig.client_email,
  clientId: firebaseConfig.client_id,
  authUri: firebaseConfig.auth_uri,
  tokenUri: firebaseConfig.token_uri,
  authProviderX509CertUrl: firebaseConfig.auth_provider_x509_cert_url,
  clientC509CertUrl: firebaseConfig.client_x509_cert_url,
};

@Injectable()
export class FirebaseAdminService {
  constructor() {
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
