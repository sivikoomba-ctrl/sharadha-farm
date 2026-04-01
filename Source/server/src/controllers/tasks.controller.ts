import { Request, Response } from 'express';
import { success, paginated, error } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import * as taskService from '../services/tasks.service';

export async function getAll(req: Request, res: Response) {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { status, zone_id, assigned_to } = req.query;
    const filters: Record<string, any> = {};
    if (status) filters.status = status as string;
    if (zone_id) filters.zone_id = zone_id as string;
    if (assigned_to) filters.assigned_to = assigned_to as string;
    const { data, total } = await taskService.getAll({ ...filters, limit, offset });
    return paginated(res, data, total, page, limit);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const task = await taskService.getById(req.params.id);
    return success(res, task);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const task = await taskService.create(req.body);
    return success(res, task, 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const task = await taskService.update(req.params.id, req.body);
    return success(res, task);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const task = await taskService.updateStatus(req.params.id, req.body.status);
    return success(res, task);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await taskService.remove(req.params.id);
    return success(res, { message: 'Task deleted successfully' });
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
