import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { registerFarmerSchema, createAdminSchema } from '../validation/auth.validation';

export const authRouter = Router();

// Farmer self-registers: Firebase client creates auth account, then calls this to build the Firestore profile
authRouter.post('/register/farmer', authenticate, validate(registerFarmerSchema), controller.registerFarmer);

// One-time admin creation (protected by ADMIN_SETUP_KEY env var)
authRouter.post('/setup/admin', validate(createAdminSchema), controller.createAdmin);
