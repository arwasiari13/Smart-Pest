import { z } from 'zod';

// uid and email come from the verified Firebase ID token – not from the request body
export const registerFarmerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    phone: z.string().min(8),
    territory: z.object({
      name: z.string().min(2),
      areaHectare: z.number().positive(),
      centerLat: z.number(),
      centerLng: z.number(),
      boundaryGeo: z.unknown().optional(),
    }),
  }),
});

export const createAdminSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    setupKey: z.string().min(1),
  }),
});
