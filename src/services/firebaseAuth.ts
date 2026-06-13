import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdTokenResult,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiRequest } from './api';

export type AppUser = {
  uid: string;
  email: string;
  role: 'ADMIN' | 'FARMER';
  status: string;
  displayName?: string;
};

// ─── Sign in ──────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
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
    const idToken = await credential.user.getIdToken();

    // Step 2: Create the Firestore profile on the backend
    await apiRequest('/auth/register/farmer', {
      method: 'POST',
      token: idToken,
      body: JSON.stringify(profile),
    });

    // Step 3: Force-refresh the token so custom claims are included
    await credential.user.getIdToken(true);

    return {
      uid: credential.user.uid,
      email: credential.user.email!,
      role: 'FARMER',
      status: 'PENDING',
    };
  } catch (err) {
    // Backend failed — delete the Firebase account so the user can retry cleanly
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
