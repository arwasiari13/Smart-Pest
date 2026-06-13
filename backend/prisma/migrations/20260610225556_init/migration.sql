-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_fellahId_fkey";

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_modeleIAId_fkey";

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_robotId_fkey";

-- DropForeignKey
ALTER TABLE "Alerte" DROP CONSTRAINT "Alerte_territoireId_fkey";

-- DropForeignKey
ALTER TABLE "Camera" DROP CONSTRAINT "Camera_robotId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "Fellah" DROP CONSTRAINT "Fellah_userId_fkey";

-- DropForeignKey
ALTER TABLE "Fellah" DROP CONSTRAINT "Fellah_validatedById_fkey";

-- DropForeignKey
ALTER TABLE "ImageCapturee" DROP CONSTRAINT "ImageCapturee_cameraId_fkey";

-- DropForeignKey
ALTER TABLE "ImageCapturee" DROP CONSTRAINT "ImageCapturee_modeleIAId_fkey";

-- DropForeignKey
ALTER TABLE "ImageCapturee" DROP CONSTRAINT "ImageCapturee_robotId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_alertId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Robot" DROP CONSTRAINT "Robot_territoireId_fkey";

-- DropForeignKey
ALTER TABLE "Territoire" DROP CONSTRAINT "Territoire_fellahId_fkey";

-- DropForeignKey
ALTER TABLE "Trajet" DROP CONSTRAINT "Trajet_robotId_fkey";

-- DropForeignKey
ALTER TABLE "Trajet" DROP CONSTRAINT "Trajet_territoireId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Alerte" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Camera" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DeviceToken" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Fellah" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ImageCapturee" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ModeleIA" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Robot" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ServeurCloud" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Territoire" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Trajet" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fellah" ADD CONSTRAINT "Fellah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fellah" ADD CONSTRAINT "Fellah_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Territoire" ADD CONSTRAINT "Territoire_fellahId_fkey" FOREIGN KEY ("fellahId") REFERENCES "Fellah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Robot" ADD CONSTRAINT "Robot_territoireId_fkey" FOREIGN KEY ("territoireId") REFERENCES "Territoire"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Camera" ADD CONSTRAINT "Camera_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trajet" ADD CONSTRAINT "Trajet_territoireId_fkey" FOREIGN KEY ("territoireId") REFERENCES "Territoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trajet" ADD CONSTRAINT "Trajet_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCapturee" ADD CONSTRAINT "ImageCapturee_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCapturee" ADD CONSTRAINT "ImageCapturee_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "Camera"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageCapturee" ADD CONSTRAINT "ImageCapturee_modeleIAId_fkey" FOREIGN KEY ("modeleIAId") REFERENCES "ModeleIA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_fellahId_fkey" FOREIGN KEY ("fellahId") REFERENCES "Fellah"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_territoireId_fkey" FOREIGN KEY ("territoireId") REFERENCES "Territoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ImageCapturee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerte" ADD CONSTRAINT "Alerte_modeleIAId_fkey" FOREIGN KEY ("modeleIAId") REFERENCES "ModeleIA"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alerte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
