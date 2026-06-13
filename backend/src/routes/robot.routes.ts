import { Router } from 'express';
import * as controller from '../controllers/robot.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { robotStatusSchema } from '../validation/robot.validation';

export const robotRouter = Router();

robotRouter.use(authenticate);
robotRouter.get('/', authorize('ADMIN'), controller.listRobots);
robotRouter.patch('/:id/status', authorize('ADMIN'), validate(robotStatusSchema), controller.updateRobotStatus);
