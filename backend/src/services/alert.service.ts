import { AlertSeverity, AlertStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/ApiError';
import { emitToTerritory, emitToUser } from '../realtime/socket';
import { createNotification, sendPushNotification } from './notification.service';

function severityFromConfidence(confidence: number): AlertSeverity {
  if (confidence >= 0.9) return AlertSeverity.HIGH;
  if (confidence >= 0.8) return AlertSeverity.MEDIUM;
  return AlertSeverity.LOW;
}

export async function createDetection(input: {
  robotId: string;
  cameraId: string;
  modeleIAId?: string;
  imageUrl: string;
  imagePath?: string;
  gpsLat: number;
  gpsLng: number;
  detectedClass: string;
  confidence: number;
  metadata?: unknown;
}) {
  const robot = await prisma.robot.findUnique({
    where: { id: input.robotId },
    include: { territoire: true },
  });

  if (!robot?.territoire) {
    throw new ApiError(404, 'Robot or assigned territory not found');
  }

  const ownerUid = robot.territoire.ownerUid;

  const image = await prisma.imageCapturee.create({
    data: {
      robotId: input.robotId,
      cameraId: input.cameraId,
      modeleIAId: input.modeleIAId,
      imageUrl: input.imageUrl,
      imagePath: input.imagePath,
      gpsLat: input.gpsLat,
      gpsLng: input.gpsLng,
      detectedClass: input.detectedClass,
      confidence: input.confidence,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  if (input.detectedClass !== 'harmful_snail') {
    return { image, alert: null };
  }

  const alert = await prisma.alerte.create({
    data: {
      ownerUid,
      territoireId: robot.territoire.id,
      robotId: robot.id,
      imageId: image.id,
      modeleIAId: input.modeleIAId,
      severity: severityFromConfidence(input.confidence),
      status: AlertStatus.PENDING,
      title: 'Harmful Snail Detected',
      message: `A harmful snail was detected by ${robot.name}.`,
      gpsLat: input.gpsLat,
      gpsLng: input.gpsLng,
      confidence: input.confidence,
    },
    include: { image: true, robot: true, territoire: true },
  });

  const notification = await createNotification({
    userId: ownerUid,
    alertId: alert.id,
    type: 'ALERT_CREATED',
    title: alert.title,
    body: alert.message,
    deepLink: `smartpest://alerts/${alert.id}`,
    data: { alertId: alert.id, screen: 'AlertDetails', severity: alert.severity },
  });

  if (notification) await sendPushNotification(notification.id);
  await prisma.alerte.update({ where: { id: alert.id }, data: { status: AlertStatus.SENT, sentAt: new Date() } });

  emitToUser(ownerUid, 'alert:new', alert);
  emitToTerritory(robot.territoire.id, 'territory:alert', alert);

  return { image, alert };
}

export async function listAlerts(user: Express.User) {
  if (user.role === 'ADMIN') {
    return prisma.alerte.findMany({
      include: { image: true, robot: true, territoire: true },
      orderBy: { detectedAt: 'desc' },
    });
  }

  return prisma.alerte.findMany({
    where: { ownerUid: user.id },
    include: { image: true, robot: true, territoire: true },
    orderBy: { detectedAt: 'desc' },
  });
}

export async function markAlertRead(_user: Express.User, id: string) {
  return prisma.alerte.update({ where: { id }, data: { status: AlertStatus.READ, readAt: new Date() } });
}

export async function resolveAlert(_user: Express.User, id: string) {
  return prisma.alerte.update({ where: { id }, data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() } });
}
