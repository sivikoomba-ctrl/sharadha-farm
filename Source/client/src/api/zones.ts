import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse, Zone } from '@shared/types';

export async function fetchZones(): Promise<PaginatedResponse<Zone>> {
  const { data } = await axiosClient.get<PaginatedResponse<Zone>>('/zones');
  return data;
}

export async function createZone(zone: Partial<Zone>): Promise<Zone> {
  const { data } = await axiosClient.post<ApiResponse<Zone>>('/zones', zone);
  return data.data;
}

export async function updateZone(id: string, zone: Partial<Zone>): Promise<Zone> {
  const { data } = await axiosClient.put<ApiResponse<Zone>>(`/zones/${id}`, zone);
  return data.data;
}

export async function deleteZone(id: string): Promise<void> {
  await axiosClient.delete(`/zones/${id}`);
}
