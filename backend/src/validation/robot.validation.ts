import { z } from 'zod';

export const robotStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'OFFLINE']).optional(),
    batteryLevel: z.number().int().min(0).max(100).optional(),
    currentLat: z.number().optional(),
    currentLng: z.number().optional(),
  }),
});
