import axiosClient from './axiosClient';
import type { ApiResponse, DashboardSummary, TrendPoint, FinanceTrendPoint } from '@shared/types';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await axiosClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
  return data.data;
}

export async function fetchHarvestTrend(): Promise<TrendPoint[]> {
  const { data } = await axiosClient.get<ApiResponse<TrendPoint[]>>('/dashboard/harvest-trend');
  return data.data;
}

export async function fetchFinanceTrend(): Promise<FinanceTrendPoint[]> {
  const { data } = await axiosClient.get<ApiResponse<FinanceTrendPoint[]>>('/dashboard/finance-trend');
  return data.data;
}
