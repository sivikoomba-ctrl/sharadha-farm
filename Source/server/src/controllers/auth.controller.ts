import { Request, Response } from 'express';
import { success, error } from '../utils/apiResponse';
import * as authService from '../services/auth.service';
import type { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { username, password, full_name, role } = req.body;
    const token = await authService.register(username, password, full_name, role);
    return success(res, { token }, 201);
  } catch (err: any) {
    const status = err.message === 'Username already exists' ? 409 : 500;
    return error(res, err.message, status);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const token = await authService.login(username, password);
    return success(res, { token });
  } catch (err: any) {
    return error(res, err.message, 401);
  }
}

export async function me(req: AuthRequest, res: Response) {
  return success(res, req.user);
}
