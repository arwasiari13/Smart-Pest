import { Router } from 'express';
import * as controller from '../controllers/alert.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { alertIdSchema, createDetectionSchema } from '../validation/alert.validation';

export const alertRouter = Router();

alertRouter.use(authenticate);
alertRouter.get('/', controller.listAlerts);
alertRouter.post('/detections', authorize('ADMIN'), validate(createDetectionSchema), controller.createDetection);
alertRouter.patch('/:id/read', validate(alertIdSchema), controller.markRead);
alertRouter.patch('/:id/resolve', validate(alertIdSchema), controller.resolve);
