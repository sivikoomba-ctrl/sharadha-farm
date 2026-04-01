import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as harvestService from '../services/harvests.service';

export async function getAll(req: Request, res: Response) {
  try {
    const { zone_id, from, to } = req.query;
    const filters: Record<string, any> = {};
    if (zone_id) filters.zone_id = zone_id as string;
    if (from) filters.from = from as string;
    if (to) filters.to = to as string;
    const harvests = await harvestService.getAll(filters);
    return success(res, harvests);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const harvest = await harvestService.create(req.body);
    return success(res, harvest, 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const harvest = await harvestService.update(req.params.id, req.body);
    if (!harvest) return error(res, 'Harvest record not found', 404);
    return success(res, harvest);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await harvestService.remove(req.params.id);
    return success(res, { message: 'Harvest record deleted successfully' });
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
