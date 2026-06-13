import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { firestore } from '../config/firebase';
import { ApiError } from '../utils/ApiError';

// ─── Types ────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'FARMER';
export type AccountStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'SUSPENDED';

export interface UserDoc {
  uid: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  phone?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  validatedAt?: Timestamp;
  validatedById?: string;
  rejectionReason?: string;
}

export interface DeviceTokenDoc {
  token: string;
  tokenType: string;
  platform: string;
  deviceId?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NotificationStatus = 'PENDING' | 'SENT' | 'READ' | 'FAILED';

export interface NotificationDoc {
  id: string;
  userId: string;
  alertId?: string;
  type: string;
  status: NotificationStatus;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  pushToken?: string;
  deepLink?: string;
  sentAt?: Timestamp;
  readAt?: Timestamp;
  failedAt?: Timestamp;
  failureText?: string;
  createdAt: Timestamp;
}

// ─── DB accessor ─────────────────────────────────────────

function db(): FirebaseFirestore.Firestore {
  if (!firestore) throw new ApiError(503, 'Firebase Firestore not configured – fill FIREBASE_* in .env');
  return firestore;
}

// ─── Users ────────────────────────────────────────────────

export async function createUserDoc(
  uid: string,
  data: Omit<UserDoc, 'uid' | 'createdAt' | 'updatedAt'>,
): Promise<UserDoc> {
  const now = FieldValue.serverTimestamp();
  const ref = db().collection('users').doc(uid);
  await ref.set({ ...data, uid, createdAt: now, updatedAt: now });
  const snap = await ref.get();
  return { uid, ...snap.data() } as UserDoc;
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
  const snap = await db().collection('users').doc(uid).get();
  if (!snap.exists) return null;
  return { uid: snap.id, ...snap.data() } as UserDoc;
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  const snap = await db().collection('users').where('email', '==', email).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, ...doc.data() } as UserDoc;
}

export async function updateUserDoc(
  uid: string,
  data: Partial<Omit<UserDoc, 'uid' | 'createdAt'>>,
): Promise<void> {
  await db()
    .collection('users')
    .doc(uid)
    .update({ ...data, updatedAt: FieldValue.serverTimestamp() });
}

export async function listFarmerDocs(statusFilter?: string): Promise<UserDoc[]> {
  let query: FirebaseFirestore.Query = db().collection('users').where('role', '==', 'FARMER');
  if (statusFilter) query = query.where('status', '==', statusFilter.toUpperCase());
  const snap = await query.orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc));
}

// ─── Device Tokens ────────────────────────────────────────

export async function upsertDeviceToken(
  userId: string,
  data: { token: string; tokenType: string; platform: string; deviceId?: string },
): Promise<void> {
  const now = FieldValue.serverTimestamp();
  await db()
    .collection('users')
    .doc(userId)
    .collection('device_tokens')
    .doc(data.token)
    .set({ ...data, isActive: true, updatedAt: now, createdAt: now }, { merge: true });
}

export async function getActiveDeviceTokens(userId: string): Promise<DeviceTokenDoc[]> {
  const snap = await db()
    .collection('users')
    .doc(userId)
    .collection('device_tokens')
    .where('isActive', '==', true)
    .get();
  return snap.docs.map((d) => d.data() as DeviceTokenDoc);
}

export async function deactivateDeviceToken(userId: string, token: string): Promise<void> {
  await db()
    .collection('users')
    .doc(userId)
    .collection('device_tokens')
    .doc(token)
    .update({ isActive: false, updatedAt: FieldValue.serverTimestamp() });
}

// ─── Notifications ────────────────────────────────────────

export async function createNotificationDoc(
  data: Omit<NotificationDoc, 'id' | 'createdAt'>,
): Promise<NotificationDoc> {
  const now = FieldValue.serverTimestamp();
  const ref = db().collection('notifications').doc();
  await ref.set({ ...data, createdAt: now });
  return { id: ref.id, ...data, createdAt: Timestamp.now() };
}

export async function getNotificationDoc(id: string): Promise<NotificationDoc | null> {
  const snap = await db().collection('notifications').doc(id).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as NotificationDoc;
}

export async function updateNotificationDoc(
  id: string,
  data: Partial<Omit<NotificationDoc, 'id' | 'createdAt'>>,
): Promise<void> {
  await db().collection('notifications').doc(id).update(data);
}

export async function listNotificationDocs(userId: string): Promise<NotificationDoc[]> {
  const snap = await db()
    .collection('notifications')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc));
}
