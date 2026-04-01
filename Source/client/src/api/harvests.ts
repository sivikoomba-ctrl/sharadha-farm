import axiosClient from '@/api/axiosClient';
import type { Harvest } from '@shared/types';

interface FetchHarvestsParams {
  zone_id?: string;
  from?: string;
  to?: string;
}

export async function fetchHarvests(params?: FetchHarvestsParams): Promise<Harvest[]> {
  const res = await axiosClient.get('/harvests', { params });
  return res.data.data;
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
