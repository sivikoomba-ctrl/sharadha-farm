import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse, InventoryItem } from '@shared/types';

export interface InventoryFilters {
  page?: number;
  limit?: number;
  category?: string;
}

export async function fetchInventory(filters: InventoryFilters = {}): Promise<PaginatedResponse<InventoryItem>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  const { data } = await axiosClient.get<PaginatedResponse<InventoryItem>>(`/inventory?${params}`);
  return data;
}

export async function createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data } = await axiosClient.post<ApiResponse<InventoryItem>>('/inventory', item);
  return data.data;
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data } = await axiosClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, item);
  return data.data;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await axiosClient.delete(`/inventory/${id}`);
}
