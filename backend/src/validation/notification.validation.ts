import { z } from 'zod';

export const registerDeviceTokenSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    tokenType: z.enum(['EXPO', 'FCM']).optional(),
    platform: z.string().min(2),
    deviceId: z.string().optional(),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
