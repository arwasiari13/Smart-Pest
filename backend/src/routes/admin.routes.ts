import { Router } from 'express';
import * as controller from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/farmers', controller.listFarmers);
adminRouter.patch('/farmers/:userId/validate', controller.validateFarmer);
adminRouter.patch('/farmers/:userId/reject', controller.rejectFarmer);
