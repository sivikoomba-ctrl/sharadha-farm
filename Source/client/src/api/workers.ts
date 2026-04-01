import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse, Worker } from '@shared/types';

export interface WorkerFilters {
  page?: number;
  limit?: number;
  role?: string;
  is_active?: boolean;
}

export async function fetchWorkers(filters: WorkerFilters = {}): Promise<PaginatedResponse<Worker>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.role && filters.role !== 'all') params.set('role', filters.role);
  if (filters.is_active !== undefined) params.set('is_active', String(filters.is_active));
  const { data } = await axiosClient.get<PaginatedResponse<Worker>>(`/workers?${params}`);
  return data;
}

export async function createWorker(worker: Partial<Worker>): Promise<Worker> {
  const { data } = await axiosClient.post<ApiResponse<Worker>>('/workers', worker);
  return data.data;
}

export async function updateWorker(id: string, worker: Partial<Worker>): Promise<Worker> {
  const { data } = await axiosClient.put<ApiResponse<Worker>>(`/workers/${id}`, worker);
  return data.data;
}

export async function deleteWorker(id: string): Promise<void> {
  await axiosClient.delete(`/workers/${id}`);
}
