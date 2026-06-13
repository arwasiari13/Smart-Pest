import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as adminService from '../services/admin.service';

export const listFarmers = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  res.json(await adminService.listFarmers(status));
});

export const validateFarmer = asyncHandler(async (req: Request, res: Response) => {
  const { robotId } = req.body;
  res.json(await adminService.validateFarmer(req.user!.id, req.params.userId, robotId));
});

export const rejectFarmer = asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  res.json(await adminService.rejectFarmer(req.user!.id, req.params.userId, reason ?? 'No reason provided'));
});
