import { Router } from 'express';
import { authRouter } from './auth.routes';
import { alertRouter } from './alert.routes';
import { notificationRouter } from './notification.routes';
import { robotRouter } from './robot.routes';
import { adminRouter } from './admin.routes';
import { iotRouter } from './iot.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok', service: 'smartpest-api' }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/alerts', alertRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/robots', robotRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/iot', iotRouter);
