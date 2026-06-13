import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging, Messaging } from 'firebase-admin/messaging';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { env } from './env';

let app: App | undefined;

if (getApps().length === 0) {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    app = initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    console.warn('[Firebase] Missing credentials – Firebase features disabled. Fill FIREBASE_* in .env');
  }
} else {
  app = getApps()[0];
}

export const firebaseReady = !!app;
export const fcm: Messaging | null = app ? getMessaging(app) : null;
export const firestore: Firestore | null = app ? getFirestore(app) : null;
export const firebaseAuth: Auth | null = app ? getAuth(app) : null;
