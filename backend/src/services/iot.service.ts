import path from 'path';
import fs from 'fs';
import { AlertSeverity, AlertStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { emitToTerritory, emitToUser } from '../realtime/socket';
import { createNotification, sendPushNotification } from './notification.service';

function severityFromConfidence(confidence: number): AlertSeverity {
  if (confidence >= 0.9) return AlertSeverity.HIGH;
  if (confidence >= 0.8) return AlertSeverity.MEDIUM;
  return AlertSeverity.LOW;
}

function saveBase64Image(base64: string, robotId: string): { imageUrl: string; imagePath: string } {
  const uploadsDir = path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR, 'captures');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const filename = `${robotId}-${Date.now()}.jpg`;
  const filePath = path.join(uploadsDir, filename);
  const data = base64.replace(/^data:image\/\w+;base64,/, '');
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

  return {
    imageUrl: `${env.PUBLIC_API_URL}/uploads/captures/${filename}`,
    imagePath: `captures/${filename}`,
  };
}

export async function authenticateIotDevice(apiKey: string, robotSerial: string) {
  if (apiKey !== env.IOT_API_KEY) return null;
  return prisma.robot.findUnique({ where: { serialNumber: robotSerial } });
}

export async function processImageFromIot(
  robotId: string,
  payload: {
    imageBase64?: string;
    imageUrl?: string;
    gpsLat: number;
    gpsLng: number;
    cameraId: string;
    detectedClass: string;
    confidence: number;
    metadata?: unknown;
  },
) {
  // Robot → territoire now stores ownerUid (Firebase UID) instead of a Prisma user FK
  const robot = await prisma.robot.findUnique({
    where: { id: robotId },
    include: { territoire: true },
  });

  if (!robot?.territoire) return { image: null, alert: null };

  const ownerUid = robot.territoire.ownerUid;

  let imageUrl = payload.imageUrl ?? '';
  let imagePath: string | undefined;

  if (!imageUrl && payload.imageBase64) {
    const saved = saveBase64Image(payload.imageBase64, robotId);
    imageUrl = saved.imageUrl;
    imagePath = saved.imagePath;
  }

  const activeModel = await prisma.modeleIA.findFirst({ where: { isActive: true } });

  const image = await prisma.imageCapturee.create({
    data: {
      robotId,
      cameraId: payload.cameraId,
      modeleIAId: activeModel?.id,
      imageUrl,
      imagePath,
      gpsLat: payload.gpsLat,
      gpsLng: payload.gpsLng,
      detectedClass: payload.detectedClass,
      confidence: payload.confidence,
      metadata: payload.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  const minConfidence = activeModel ? Number(activeModel.confidenceMin) : 0.8;
  if (payload.detectedClass !== 'harmful_snail' || payload.confidence < minConfidence) {
    return { image, alert: null };
  }

  const alert = await prisma.alerte.create({
    data: {
      ownerUid,
      territoireId: robot.territoire.id,
      robotId: robot.id,
      imageId: image.id,
      modeleIAId: activeModel?.id,
      severity: severityFromConfidence(payload.confidence),
      status: AlertStatus.PENDING,
      title: 'Harmful Snail Detected',
      message: `A harmful snail was detected by ${robot.name} with ${Math.round(payload.confidence * 100)}% confidence.`,
      gpsLat: payload.gpsLat,
      gpsLng: payload.gpsLng,
      confidence: payload.confidence,
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

  await sendPushNotification(notification.id);
  await prisma.alerte.update({ where: { id: alert.id }, data: { status: AlertStatus.SENT, sentAt: new Date() } });

  emitToUser(ownerUid, 'alert:new', alert);
  emitToTerritory(robot.territoire.id, 'territory:alert', alert);

  return { image, alert };
}
