import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as notificationService from '../services/notification.service';

export const registerDeviceToken = asyncHandler(async (req: Request, res: Response) => {
  const device = await notificationService.registerDeviceToken({ userId: req.user!.id, ...req.body });
  res.status(201).json(device);
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  res.json(await notificationService.listNotifications(req.user!.id));
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  res.json(await notificationService.markNotificationRead(req.user!.id, req.params.id));
});
