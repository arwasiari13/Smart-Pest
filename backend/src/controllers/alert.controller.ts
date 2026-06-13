import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as alertService from '../services/alert.service';

export const createDetection = asyncHandler(async (req: Request, res: Response) => {
  const result = await alertService.createDetection(req.body);
  res.status(201).json(result);
});

export const listAlerts = asyncHandler(async (req: Request, res: Response) => {
  res.json(await alertService.listAlerts(req.user!));
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  res.json(await alertService.markAlertRead(req.user!, req.params.id));
});

export const resolve = asyncHandler(async (req: Request, res: Response) => {
  res.json(await alertService.resolveAlert(req.user!, req.params.id));
});
