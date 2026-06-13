import { Router } from 'express';
import * as controller from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { notificationIdSchema, registerDeviceTokenSchema } from '../validation/notification.validation';

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.post('/device-tokens', validate(registerDeviceTokenSchema), controller.registerDeviceToken);
notificationRouter.get('/', controller.listNotifications);
notificationRouter.patch('/:id/read', validate(notificationIdSchema), controller.markRead);
