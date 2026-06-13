import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticateIotDevice, processImageFromIot } from '../services/iot.service';
import { ApiError } from '../utils/ApiError';

export const iotRouter = Router();

const detectionSchema = z.object({
  serialNumber: z.string(),
  apiKey: z.string(),
  cameraId: z.string(),
  gpsLat: z.number(),
  gpsLng: z.number(),
  detectedClass: z.string(),
  confidence: z.number().min(0).max(1),
  imageBase64: z.string().optional(),
  imageUrl: z.string().optional(),
  metadata: z.unknown().optional(),
});

iotRouter.post(
  '/detection',
  asyncHandler(async (req: Request, res: Response) => {
    const parsed = detectionSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, 'Invalid detection payload');

    const { serialNumber, apiKey, ...payload } = parsed.data;

    const robot = await authenticateIotDevice(apiKey, serialNumber);
    if (!robot) throw new ApiError(401, 'Invalid IoT credentials');

    const result = await processImageFromIot(robot.id, payload);

    res.json({
      imageId: result.image?.id ?? null,
      alertCreated: !!result.alert,
      alertId: result.alert?.id ?? null,
      severity: result.alert?.severity ?? null,
      message: result.alert
        ? `Snail detected — alert sent to farmer`
        : 'No harmful snail detected',
    });
  }),
);

iotRouter.get('/ping', (_req, res) => res.json({ status: 'ok' }));
