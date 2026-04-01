import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as authService from '../services/auth.service';
import type { AuthRequest } from '../middleware/auth';

export async function register(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      return error(res, 'Only admins can create new users', 403);
    }
    const { username, password, full_name, role } = req.body;
    const result = await authService.register(username, password, full_name, role);
    return success(res, result, 201);
  } catch (err: any) {
    const status = err.message === 'Username already exists' ? 409 : 500;
    return error(res, err.message, status);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message, 401);
  }
}

export async function me(req: AuthRequest, res: Response) {
  return success(res, req.user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { full_name, current_password, new_password } = req.body;
    const result = await authService.updateProfile(req.user!.id, { full_name, current_password, new_password });
    return success(res, result);
  } catch (err: any) {
    const status = err.message === 'Current password is incorrect' ? 400 : 500;
    return error(res, err.message, status);
  }
}
