import { prisma } from '../config/prisma';
import { emitRobotUpdate } from '../realtime/socket';
import { firestore, firebaseReady } from '../config/firebase';

export async function listRobots() {
  return prisma.robot.findMany({ include: { territoire: true, cameras: true }, orderBy: { name: 'asc' } });
}

export async function updateRobotStatus(
  id: string,
  data: { status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE'; batteryLevel?: number; currentLat?: number; currentLng?: number },
) {
  const robot = await prisma.robot.update({
    where: { id },
    data: { ...data, lastSeenAt: new Date() },
  });

  emitRobotUpdate(robot);

  // Mirror live telemetry to Firestore for real-time frontend subscriptions
  if (firebaseReady && firestore) {
    firestore.collection('robots').doc(id).set(
      {
        status: robot.status,
        batteryLevel: robot.batteryLevel,
        currentLat: robot.currentLat ? Number(robot.currentLat) : null,
        currentLng: robot.currentLng ? Number(robot.currentLng) : null,
        lastSeenAt: robot.lastSeenAt,
        updatedAt: new Date(),
      },
      { merge: true }
    ).catch(() => undefined); // non-blocking, don't crash if Firestore is unavailable
  }

  return robot;
}
