import { firebaseAuth } from '../config/firebase';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import * as firestoreService from './firestore.service';

// Called after the mobile app does createUserWithEmailAndPassword (Firebase client SDK).
// The client sends its Firebase ID token in the Authorization header; the middleware sets req.user.id = uid.
export async function registerFarmer(input: {
  uid: string;
  email: string;
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
}) {
  if (!firebaseAuth) throw new ApiError(503, 'Firebase not configured');

  const existing = await firestoreService.getUserDoc(input.uid);
  if (existing) throw new ApiError(409, 'Farmer profile already exists');

  // Store role in Firebase custom claims so every ID token carries the role
  await firebaseAuth.setCustomUserClaims(input.uid, { role: 'FARMER', status: 'PENDING' });

  // Create the user profile in Firestore
  const user = await firestoreService.createUserDoc(input.uid, {
    email: input.email,
    role: 'FARMER',
    status: 'PENDING',
    phone: input.phone,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  // Create the territory in Postgres (operational data)
  await prisma.territoire.create({
    data: {
      ownerUid: input.uid,
      name: input.territory.name,
      areaHectare: input.territory.areaHectare,
      centerLat: input.territory.centerLat,
      centerLng: input.territory.centerLng,
      boundaryGeo: input.territory.boundaryGeo as any,
    },
  });

  return { uid: user.uid, email: user.email, role: user.role, status: user.status };
}

// Creates an admin account (server-side only – call via seed script or /auth/setup/admin)
export async function createAdminUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  setupKey: string;
}) {
  if (!firebaseAuth) throw new ApiError(503, 'Firebase not configured');
  if (input.setupKey !== process.env.ADMIN_SETUP_KEY) throw new ApiError(403, 'Invalid setup key');

  const userRecord = await firebaseAuth.createUser({
    email: input.email,
    password: input.password,
    displayName: `${input.firstName} ${input.lastName}`,
  });

  await firebaseAuth.setCustomUserClaims(userRecord.uid, { role: 'ADMIN', status: 'VALIDATED' });

  const user = await firestoreService.createUserDoc(userRecord.uid, {
    email: input.email,
    role: 'ADMIN',
    status: 'VALIDATED',
    firstName: input.firstName,
    lastName: input.lastName,
  });

  return { uid: user.uid, email: user.email, role: user.role, status: user.status };
}
