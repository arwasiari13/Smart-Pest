import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as authService from '../services/auth.service';

// POST /auth/register/farmer  (requires valid Firebase ID token in Authorization header)
// The mobile app first calls Firebase createUserWithEmailAndPassword, then hits this endpoint.
export const registerFarmer = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.registerFarmer({
    uid: req.user!.id,
    email: req.user!.email,
    ...req.body,
  });
  res.status(201).json({ user });
});

// POST /auth/setup/admin  (one-time admin creation, protected by ADMIN_SETUP_KEY)
export const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.createAdminUser(req.body);
  res.status(201).json({ user });
});
