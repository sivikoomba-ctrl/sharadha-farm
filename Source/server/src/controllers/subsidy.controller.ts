import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as subsidyService from '../services/subsidy.service';
import { docKeySchema } from '../validators/subsidy.validator';

export async function getAll(_req: Request, res: Response) {
  const data = await subsidyService.getAll();
  return success(res, data);
}

export async function getActive(_req: Request, res: Response) {
  const app = await subsidyService.getActive();
  if (!app) return success(res, null);
  const detail = await subsidyService.getById(app.id);
  return success(res, detail);
}

export async function getById(req: Request, res: Response) {
  const detail = await subsidyService.getById(req.params.id);
  if (!detail) return error(res, 'Subsidy application not found', 404);
  return success(res, detail);
}

export async function create(req: Request, res: Response) {
  try {
    const detail = await subsidyService.create(req.body);
    return success(res, detail, 201);
  } catch (err: any) {
    return error(res, err.message || 'Failed to create application', 500);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const detail = await subsidyService.update(req.params.id, req.body);
    if (!detail) return error(res, 'Subsidy application not found', 404);
    return success(res, detail);
  } catch (err: any) {
    return error(res, err.message || 'Failed to update application', 400);
  }
}

export async function remove(req: Request, res: Response) {
  const ok = await subsidyService.remove(req.params.id);
  if (!ok) return error(res, 'Subsidy application not found', 404);
  return success(res, { deleted: true });
}

export async function updateDocument(req: Request, res: Response) {
  const docKeyResult = docKeySchema.safeParse(req.params.docKey);
  if (!docKeyResult.success) return error(res, 'Invalid document key', 400);

  const doc = await subsidyService.updateDocument(req.params.id, docKeyResult.data, req.body);
  if (!doc) return error(res, 'Document not found for this application', 404);
  return success(res, doc);
}

export async function advanceStage(req: Request, res: Response) {
  try {
    const detail = await subsidyService.advanceStage(req.params.id, req.body);
    if (!detail) return error(res, 'Subsidy application not found', 404);
    return success(res, detail);
  } catch (err: any) {
    return error(res, err.message || 'Failed to advance stage', 400);
  }
}
