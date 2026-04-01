import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as dashboardService from '../services/dashboard.service';

export async function getSummary(req: Request, res: Response) {
  try {
    const summary = await dashboardService.getSummary();
    return success(res, summary);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getHarvestTrend(req: Request, res: Response) {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const trend = await dashboardService.getHarvestTrend();
    return success(res, trend);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getFinanceTrend(req: Request, res: Response) {
  try {
    const trend = await dashboardService.getFinanceTrend();
    return success(res, trend);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
