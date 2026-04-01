import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as zoneService from '../services/zones.service';

export async function getAll(req: Request, res: Response) {
  try {
    const zones = await zoneService.getAll();
    return success(res, zones);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const zone = await zoneService.getById(req.params.id);
    if (!zone) return error(res, 'Zone not found', 404);
    return success(res, zone);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const zone = await zoneService.create(req.body);
    return success(res, zone, 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const zone = await zoneService.update(req.params.id, req.body);
    if (!zone) return error(res, 'Zone not found', 404);
    return success(res, zone);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await zoneService.remove(req.params.id);
    return success(res, { message: 'Zone deleted successfully' });
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
