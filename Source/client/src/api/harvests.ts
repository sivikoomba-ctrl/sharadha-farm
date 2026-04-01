import axiosClient from '@/api/axiosClient';
import type { Harvest, PaginatedResponse } from '@shared/types';

interface FetchHarvestsParams {
  page?: number;
  limit?: number;
  zone_id?: string;
  from?: string;
  to?: string;
}

export async function fetchHarvests(params?: FetchHarvestsParams): Promise<PaginatedResponse<Harvest>> {
  const res = await axiosClient.get('/harvests', { params });
  return res.data;
}

export async function createHarvest(data: Partial<Harvest>): Promise<Harvest> {
  const res = await axiosClient.post('/harvests', data);
  return res.data.data;
}

export async function updateHarvest(id: string, data: Partial<Harvest>): Promise<Harvest> {
  const res = await axiosClient.put(`/harvests/${id}`, data);
  return res.data.data;
}

export async function deleteHarvest(id: string): Promise<void> {
  await axiosClient.delete(`/harvests/${id}`);
}
