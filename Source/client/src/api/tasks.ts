import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse, Task } from '@shared/types';

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.priority && filters.priority !== 'all') params.set('priority', filters.priority);
  const { data } = await axiosClient.get<PaginatedResponse<Task>>(`/tasks?${params}`);
  return data;
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const { data } = await axiosClient.post<ApiResponse<Task>>('/tasks', task);
  return data.data;
}

export async function updateTask(id: string, task: Partial<Task>): Promise<Task> {
  const { data } = await axiosClient.put<ApiResponse<Task>>(`/tasks/${id}`, task);
  return data.data;
}

export async function deleteTask(id: string): Promise<void> {
  await axiosClient.delete(`/tasks/${id}`);
}
