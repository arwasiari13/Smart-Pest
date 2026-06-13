import { z } from 'zod';

export const createDetectionSchema = z.object({
  body: z.object({
    robotId: z.string().uuid(),
    cameraId: z.string().uuid(),
    modeleIAId: z.string().uuid().optional(),
    imageUrl: z.string().url(),
    imagePath: z.string().optional(),
    gpsLat: z.number(),
    gpsLng: z.number(),
    detectedClass: z.string(),
    confidence: z.number().min(0).max(1),
    metadata: z.unknown().optional(),
  }),
});

export const alertIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
