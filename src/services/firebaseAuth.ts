import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdTokenResult,
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';

export type AppUser = {
  uid: string;
  email: string;
  role: 'ADMIN' | 'FARMER';
  status: string;
  displayName?: string;
};

// ─── Save push token to Firestore ─────────────────────────

async function savePushToken(uid: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }
    if (finalStatus !== 'granted') return;

    const token = await Notifications.getExpoPushTokenAsync();
    await updateDoc(doc(db, 'users', uid), {
      expoPushToken: token.data,
      updatedAt: serverTimestamp(),
    });
  } catch {}
}

// ─── Sign in ──────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  savePushToken(credential.user.uid);
  return getUserProfile(credential.user);
}

// ─── Register a farmer ────────────────────────────────────
// Creates the Firebase Auth account first, then POSTs to the backend to build the Firestore profile.

export async function registerFarmer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  territory: {
    name: string;
    areaHectare: number;
    centerLat: number;
    centerLng: number;
    boundaryGeo?: unknown;
  };
}): Promise<AppUser> {
  const { email, password, ...profile } = input;

  // Step 1: Create the Firebase Auth account
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    // Write the farmer profile to the users collection
    await setDoc(doc(db, 'users', credential.user.uid), {
      uid: credential.user.uid,
      email: credential.user.email,
      role: 'FARMER',
      status: 'PENDING',
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: credential.user.uid,
      email: credential.user.email!,
      role: 'FARMER',
      status: 'PENDING',
    };
  } catch (err) {
    // Firestore write failed — delete the Firebase account so the user can retry cleanly
    await credential.user.delete();
    throw err;
  }
}

// ─── Sign out ─────────────────────────────────────────────

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// ─── Get current user profile ─────────────────────────────

export async function getUserProfile(user: User): Promise<AppUser> {
  const tokenResult = await getIdTokenResult(user);
  return {
    uid: user.uid,
    email: user.email ?? '',
    role: (tokenResult.claims['role'] as 'ADMIN' | 'FARMER') ?? 'FARMER',
    status: (tokenResult.claims['status'] as string) ?? 'PENDING',
    displayName: user.displayName ?? undefined,
  };
}

// ─── Get a fresh ID token (attach to every API call) ─────

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}

// ─── Auth state listener ──────────────────────────────────

export function onAuthStateChange(callback: (user: AppUser | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return callback(null);
    try {
      callback(await getUserProfile(user));
    } catch {
      callback(null);
    }
  });
}
