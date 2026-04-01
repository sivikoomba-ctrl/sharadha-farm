import { Request, Response } from 'express';
import { success, paginated, error } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';
import * as inventoryService from '../services/inventory.service';

export async function getAll(req: Request, res: Response) {
  try {
    const { page, limit, offset } = parsePagination(req);
    const { category, low_stock } = req.query;
    const filters: Record<string, any> = {};
    if (category) filters.category = category as string;
    if (low_stock !== undefined) filters.low_stock = low_stock === 'true';
    const { data, total } = await inventoryService.getAll({ ...filters, limit, offset });
    return paginated(res, data, total, page, limit);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const item = await inventoryService.getById(req.params.id);
    if (!item) return error(res, 'Inventory item not found', 404);
    return success(res, item);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const item = await inventoryService.create(req.body);
    return success(res, item, 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const item = await inventoryService.update(req.params.id, req.body);
    if (!item) return error(res, 'Inventory item not found', 404);
    return success(res, item);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await inventoryService.remove(req.params.id);
    return success(res, { message: 'Inventory item deleted successfully' });
  } catch (err: any) {
    return error(res, err.message, 500);
  }
}
