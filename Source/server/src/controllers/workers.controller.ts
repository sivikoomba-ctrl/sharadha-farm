import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as workerService from '../services/workers.service';

export async function getAll(req: Request, res: Response) {
  try {
    const { role, is_active } = req.query;
    const filters: Record<string, any> = {};
    if (role) filters.role = role as string;
    if (is_active !== undefined) filters.is_active = is_active === 'true';
    const workers = await workerService.getAll(filters);
    return success(res, workers);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const worker = await workerService.getById(req.params.id);
    if (!worker) return error(res, 'Worker not found', 404);
    return success(res, worker);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const worker = await workerService.create(req.body);
    return success(res, worker, 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const worker = await workerService.update(req.params.id, req.body);
    if (!worker) return error(res, 'Worker not found', 404);
    return success(res, worker);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await workerService.remove(req.params.id);
    return success(res, { message: 'Worker deleted successfully' });
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
