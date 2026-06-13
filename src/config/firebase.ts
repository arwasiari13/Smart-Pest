import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

// ─── Fill these from Firebase Console → Project Settings → General ─────────────
// Or expose them via app.json extra / EAS secrets (never commit real keys)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyDOSOjVy31fpKmBqoBgoreibfxkhD_KIPg',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'smartpest-52d02.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'smartpest-52d02',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'smartpest-52d02.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '448702671945',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:448702671945:web:614ca9695422a8b69f6398',
};

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const firebaseApp = app;
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Messaging is only available in native builds with @react-native-firebase/messaging
// For web/Expo Go we fall back gracefully
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  try {
    const supported = await isSupported();
    if (!supported) return null;
    return getMessaging(app);
  } catch {
    return null;
  }
}
