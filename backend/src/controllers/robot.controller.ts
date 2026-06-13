import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as robotService from '../services/robot.service';

export const listRobots = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await robotService.listRobots());
});

export const updateRobotStatus = asyncHandler(async (req: Request, res: Response) => {
  res.json(await robotService.updateRobotStatus(req.params.id, req.body));
});
