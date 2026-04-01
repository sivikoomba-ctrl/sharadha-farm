import axiosClient from './axiosClient';
import type { ApiResponse, PaginatedResponse, Transaction } from '@shared/types';

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: string;
  from?: string;
  to?: string;
}

export interface TransactionSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
}

export async function fetchTransactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.type && filters.type !== 'all') params.set('type', filters.type);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const { data } = await axiosClient.get<PaginatedResponse<Transaction>>(`/finance?${params}`);
  return data;
}

export async function fetchTransactionSummary(filters: { from?: string; to?: string } = {}): Promise<TransactionSummary> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const { data } = await axiosClient.get<ApiResponse<TransactionSummary>>(`/finance/summary?${params}`);
  return data.data;
}

export async function createTransaction(txn: Partial<Transaction>): Promise<Transaction> {
  const { data } = await axiosClient.post<ApiResponse<Transaction>>('/finance', txn);
  return data.data;
}

export async function updateTransaction(id: string, txn: Partial<Transaction>): Promise<Transaction> {
  const { data } = await axiosClient.put<ApiResponse<Transaction>>(`/finance/${id}`, txn);
  return data.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await axiosClient.delete(`/finance/${id}`);
}
