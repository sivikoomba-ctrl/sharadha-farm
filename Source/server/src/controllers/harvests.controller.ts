import { Request, Response } from 'express';
import { success, paginated, error } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import * as harvestService from '../services/harvests.service';

export async function getAll(req: Request, res: Response) {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { zone_id, from, to } = req.query;
    const filters: Record<string, any> = {};
    if (zone_id) filters.zone_id = zone_id as string;
    if (from) filters.start_date = from as string;
    if (to) filters.end_date = to as string;
    const { data, total } = await harvestService.getAll({ ...filters, limit, offset });
    return paginated(res, data, total, page, limit);
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
