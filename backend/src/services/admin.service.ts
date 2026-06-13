import { firebaseAuth } from '../config/firebase';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import * as firestoreService from './firestore.service';
import { createNotification, sendPushNotification } from './notification.service';

export async function listFarmers(statusFilter?: string) {
  // Fetch farmer profiles from Firestore
  const farmers = await firestoreService.listFarmerDocs(statusFilter);

  // Enrich each farmer with their territories from Postgres
  const enriched = await Promise.all(
    farmers.map(async (farmer) => {
      const territoires = await prisma.territoire.findMany({
        where: { ownerUid: farmer.uid },
        include: { robots: true },
      });
      return { ...farmer, territoires };
    }),
  );

  return enriched;
}

export async function validateFarmer(adminUid: string, farmerUid: string, robotId?: string) {
  if (!firebaseAuth) throw new ApiError(503, 'Firebase not configured');

  const farmer = await firestoreService.getUserDoc(farmerUid);
  if (!farmer || farmer.role !== 'FARMER') throw new ApiError(404, 'Farmer not found');
  if (farmer.status !== 'PENDING') throw new ApiError(400, 'Farmer is not in PENDING status');

  // Update Firestore profile
  await firestoreService.updateUserDoc(farmerUid, {
    status: 'VALIDATED',
    validatedAt: undefined, // will be set by server timestamp below
    validatedById: adminUid,
  });

  // Update Firebase Auth custom claims so next token includes new status
  await firebaseAuth.setCustomUserClaims(farmerUid, { role: 'FARMER', status: 'VALIDATED' });

  // Optionally assign a robot to the farmer's first territory
  if (robotId) {
    const territoire = await prisma.territoire.findFirst({ where: { ownerUid: farmerUid } });
    if (territoire) {
      await prisma.robot.update({
        where: { id: robotId },
        data: { territoireId: territoire.id },
      });
    }
  }

  // Notify the farmer via push + real-time
  const notification = await createNotification({
    userId: farmerUid,
    type: 'ACCOUNT_VALIDATED',
    title: 'Account Validated',
    body: 'Your SmartPest account has been validated. You can now access your dashboard.',
    deepLink: 'smartpest://dashboard',
    data: { screen: 'FarmerDashboard' },
  });
  await sendPushNotification(notification.id);

  return { success: true };
}

export async function rejectFarmer(adminUid: string, farmerUid: string, reason: string) {
  if (!firebaseAuth) throw new ApiError(503, 'Firebase not configured');

  const farmer = await firestoreService.getUserDoc(farmerUid);
  if (!farmer || farmer.role !== 'FARMER') throw new ApiError(404, 'Farmer not found');

  await firestoreService.updateUserDoc(farmerUid, {
    status: 'REJECTED',
    rejectionReason: reason,
    validatedById: adminUid,
  });

  await firebaseAuth.setCustomUserClaims(farmerUid, { role: 'FARMER', status: 'REJECTED' });

  return { success: true };
}
