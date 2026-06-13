/**
 * Seed operational IoT data only.
 * Users (admin & farmer) are created via Firebase Console or POST /api/v1/auth/setup/admin.
 *
 * To use this seed, you need at least one farmer Firebase UID.
 * Replace FARMER_UID below with a real Firebase UID before running.
 */

import { PrismaClient, RobotStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Replace with a real Firebase UID after creating the farmer account
const FARMER_UID = 'REPLACE_WITH_FIREBASE_FARMER_UID';

async function main() {
  console.log('Seeding operational IoT data...');

  const territoire = await prisma.territoire.upsert({
    where: { id: 'seed-territoire-01' },
    update: {},
    create: {
      id: 'seed-territoire-01',
      ownerUid: FARMER_UID,
      name: 'Zone A - Casablanca',
      areaHectare: 12.5,
      centerLat: 33.5731,
      centerLng: -7.5898,
      boundaryGeo: {
        type: 'Polygon',
        coordinates: [
          [[-7.591, 33.572], [-7.588, 33.572], [-7.588, 33.575], [-7.591, 33.575], [-7.591, 33.572]],
        ],
      },
    },
  });

  const robot = await prisma.robot.upsert({
    where: { serialNumber: 'SP-ROB-ALPHA-01' },
    update: {},
    create: {
      territoireId: territoire.id,
      serialNumber: 'SP-ROB-ALPHA-01',
      name: 'Robot-Alpha-01',
      status: RobotStatus.ACTIVE,
      batteryLevel: 87,
      firmwareVersion: '1.0.3',
      currentLat: 33.5731,
      currentLng: -7.5898,
      lastSeenAt: new Date(),
    },
  });

  const camera = await prisma.camera.create({
    data: {
      robotId: robot.id,
      name: 'Front Camera',
      resolution: '1920x1080',
    },
  });

  const modeleIA = await prisma.modeleIA.upsert({
    where: { name_version: { name: 'SnailDetector', version: '1.0.0' } },
    update: {},
    create: {
      name: 'SnailDetector',
      version: '1.0.0',
      harmfulClassName: 'harmful_snail',
      confidenceMin: 0.8,
      isActive: true,
      deployedAt: new Date(),
    },
  });

  await prisma.trajet.create({
    data: {
      territoireId: territoire.id,
      robotId: robot.id,
      name: 'Route-A1',
      pathGeo: {
        type: 'LineString',
        coordinates: [[-7.5898, 33.5731], [-7.5892, 33.5738], [-7.5887, 33.5742]],
      },
      isActive: true,
    },
  });

  const image = await prisma.imageCapturee.create({
    data: {
      robotId: robot.id,
      cameraId: camera.id,
      modeleIAId: modeleIA.id,
      imageUrl: 'https://storage.smartpest.local/captures/sample-snail.jpg',
      imagePath: 'captures/sample-snail.jpg',
      gpsLat: 33.5731,
      gpsLng: -7.5898,
      detectedClass: 'harmful_snail',
      confidence: 0.942,
      metadata: { width: 1920, height: 1080 },
    },
  });

  await prisma.alerte.create({
    data: {
      ownerUid: FARMER_UID,
      territoireId: territoire.id,
      robotId: robot.id,
      imageId: image.id,
      modeleIAId: modeleIA.id,
      severity: 'HIGH',
      status: 'SENT',
      title: 'Harmful Snail Detected',
      message: 'A harmful snail was detected in Zone A.',
      gpsLat: 33.5731,
      gpsLng: -7.5898,
      confidence: 0.942,
      sentAt: new Date(),
    },
  });

  await prisma.serveurCloud.upsert({
    where: { id: 'seed-cloud-01' },
    update: {},
    create: {
      id: 'seed-cloud-01',
      name: 'Local Development Storage',
      provider: 'LOCAL',
      endpointUrl: 'http://localhost:4000/uploads',
      isActive: true,
    },
  });

  console.log('Seed complete.');
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
