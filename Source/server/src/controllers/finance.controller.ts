import { Request, Response } from 'express';
import { success, paginated, error } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import * as financeService from '../services/finance.service';

export async function getAll(req: Request, res: Response) {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { type, category, from, to } = req.query;
    const filters: Record<string, any> = {};
    if (type) filters.type = type as string;
    if (category) filters.category = category as string;
    if (from) filters.from = from as string;
    if (to) filters.to = to as string;
    const { data, total } = await financeService.getAll({ ...filters, limit, offset });
    return paginated(res, data, total, page, limit);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const transaction = await financeService.getById(req.params.id);
    return success(res, transaction);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const transaction = await financeService.create(req.body);
    return success(res, transaction, 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const transaction = await financeService.update(req.params.id, req.body);
    return success(res, transaction);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await financeService.remove(req.params.id);
    return success(res, { message: 'Transaction deleted successfully' });
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getSummary(req: Request, res: Response) {
  try {
    const { from, to } = req.query;
    const filters: Record<string, any> = {};
    if (from) filters.from = from as string;
    if (to) filters.to = to as string;
    const summary = await financeService.getSummary(filters);
    return success(res, summary);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
