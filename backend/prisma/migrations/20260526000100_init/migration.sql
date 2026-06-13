CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'FELLAH');
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'SUSPENDED');
CREATE TYPE "RobotStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE');
CREATE TYPE "CameraStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'SENT', 'READ', 'RESOLVED');
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'READ', 'FAILED');
CREATE TYPE "NotificationType" AS ENUM ('ALERT_CREATED', 'ALERT_RESOLVED', 'ROBOT_STATUS', 'ACCOUNT_VALIDATED', 'SYSTEM');
CREATE TYPE "StorageProvider" AS ENUM ('LOCAL', 'FIREBASE', 'S3');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3)
);

CREATE TABLE "Admin" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "fullName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Fellah" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "cin" TEXT,
  "validatedAt" TIMESTAMP(3),
  "validatedById" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Territoire" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "fellahId" TEXT NOT NULL REFERENCES "Fellah"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "areaHectare" DECIMAL(10,2) NOT NULL,
  "centerLat" DECIMAL(10,7) NOT NULL,
  "centerLng" DECIMAL(10,7) NOT NULL,
  "boundaryGeo" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Robot" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "territoireId" TEXT REFERENCES "Territoire"("id") ON DELETE SET NULL,
  "serialNumber" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "status" "RobotStatus" NOT NULL DEFAULT 'INACTIVE',
  "batteryLevel" INTEGER NOT NULL DEFAULT 100 CHECK ("batteryLevel" BETWEEN 0 AND 100),
  "firmwareVersion" TEXT,
  "currentLat" DECIMAL(10,7),
  "currentLng" DECIMAL(10,7),
  "lastSeenAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Camera" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "robotId" TEXT NOT NULL REFERENCES "Robot"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "resolution" TEXT,
  "status" "CameraStatus" NOT NULL DEFAULT 'ACTIVE',
  "mountedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ModeleIA" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "harmfulClassName" TEXT NOT NULL DEFAULT 'harmful_snail',
  "confidenceMin" DECIMAL(4,3) NOT NULL DEFAULT 0.80,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "deployedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("name", "version")
);

CREATE TABLE "Trajet" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "territoireId" TEXT NOT NULL REFERENCES "Territoire"("id") ON DELETE CASCADE,
  "robotId" TEXT NOT NULL REFERENCES "Robot"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "pathGeo" JSONB NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "scheduledAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ImageCapturee" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "robotId" TEXT NOT NULL REFERENCES "Robot"("id") ON DELETE CASCADE,
  "cameraId" TEXT NOT NULL REFERENCES "Camera"("id") ON DELETE CASCADE,
  "modeleIAId" TEXT REFERENCES "ModeleIA"("id") ON DELETE SET NULL,
  "imageUrl" TEXT NOT NULL,
  "imagePath" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "gpsLat" DECIMAL(10,7) NOT NULL,
  "gpsLng" DECIMAL(10,7) NOT NULL,
  "detectedClass" TEXT,
  "confidence" DECIMAL(5,4),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Alerte" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "fellahId" TEXT NOT NULL REFERENCES "Fellah"("id") ON DELETE CASCADE,
  "territoireId" TEXT NOT NULL REFERENCES "Territoire"("id") ON DELETE CASCADE,
  "robotId" TEXT NOT NULL REFERENCES "Robot"("id") ON DELETE CASCADE,
  "imageId" TEXT NOT NULL UNIQUE REFERENCES "ImageCapturee"("id") ON DELETE CASCADE,
  "modeleIAId" TEXT REFERENCES "ModeleIA"("id") ON DELETE SET NULL,
  "severity" "AlertSeverity" NOT NULL,
  "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "gpsLat" DECIMAL(10,7) NOT NULL,
  "gpsLng" DECIMAL(10,7) NOT NULL,
  "confidence" DECIMAL(5,4) NOT NULL,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "alertId" TEXT REFERENCES "Alerte"("id") ON DELETE CASCADE,
  "type" "NotificationType" NOT NULL,
  "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "data" JSONB,
  "pushToken" TEXT,
  "deepLink" TEXT,
  "sentAt" TIMESTAMP(3),
  "readAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "failureText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DeviceToken" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "token" TEXT NOT NULL UNIQUE,
  "platform" TEXT NOT NULL,
  "deviceId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ServeurCloud" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "provider" "StorageProvider" NOT NULL,
  "endpointUrl" TEXT,
  "bucketName" TEXT,
  "region" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "Fellah_validatedById_idx" ON "Fellah"("validatedById");
CREATE INDEX "Territoire_fellahId_idx" ON "Territoire"("fellahId");
CREATE INDEX "Territoire_isActive_idx" ON "Territoire"("isActive");
CREATE INDEX "Robot_territoireId_idx" ON "Robot"("territoireId");
CREATE INDEX "Robot_status_idx" ON "Robot"("status");
CREATE INDEX "Robot_lastSeenAt_idx" ON "Robot"("lastSeenAt");
CREATE INDEX "Camera_robotId_idx" ON "Camera"("robotId");
CREATE INDEX "Camera_status_idx" ON "Camera"("status");
CREATE INDEX "ModeleIA_isActive_idx" ON "ModeleIA"("isActive");
CREATE INDEX "Trajet_territoireId_idx" ON "Trajet"("territoireId");
CREATE INDEX "Trajet_robotId_idx" ON "Trajet"("robotId");
CREATE INDEX "Trajet_isActive_idx" ON "Trajet"("isActive");
CREATE INDEX "ImageCapturee_robotId_idx" ON "ImageCapturee"("robotId");
CREATE INDEX "ImageCapturee_cameraId_idx" ON "ImageCapturee"("cameraId");
CREATE INDEX "ImageCapturee_modeleIAId_idx" ON "ImageCapturee"("modeleIAId");
CREATE INDEX "ImageCapturee_capturedAt_idx" ON "ImageCapturee"("capturedAt");
CREATE INDEX "ImageCapturee_gpsLat_gpsLng_idx" ON "ImageCapturee"("gpsLat", "gpsLng");
CREATE INDEX "Alerte_fellahId_status_idx" ON "Alerte"("fellahId", "status");
CREATE INDEX "Alerte_territoireId_idx" ON "Alerte"("territoireId");
CREATE INDEX "Alerte_robotId_idx" ON "Alerte"("robotId");
CREATE INDEX "Alerte_severity_idx" ON "Alerte"("severity");
CREATE INDEX "Alerte_detectedAt_idx" ON "Alerte"("detectedAt");
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");
CREATE INDEX "Notification_alertId_idx" ON "Notification"("alertId");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "DeviceToken_userId_isActive_idx" ON "DeviceToken"("userId", "isActive");
CREATE INDEX "ServeurCloud_provider_idx" ON "ServeurCloud"("provider");
CREATE INDEX "ServeurCloud_isActive_idx" ON "ServeurCloud"("isActive");
