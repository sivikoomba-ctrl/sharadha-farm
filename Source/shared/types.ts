export interface Zone {
  id: string;
  name: string;
  area_hectares: number;
  variety: string;
  planting_date: string;
  status: ZoneStatus;
  notes: string | null;
  sensor_config: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Worker {
  id: string;
  full_name: string;
  phone: string;
  role: WorkerRole;
  daily_wage: number;
  is_active: boolean;
  joined_date: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  zone_id: string | null;
  assigned_to: string | null;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  due_date: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  zone_name?: string;
  worker_name?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorder_level: number;
  unit_cost: number;
  location: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  transaction_date: string;
  worker_id: string | null;
  inventory_item_id: string | null;
  created_at: string;
  worker_name?: string;
  item_name?: string;
}

export interface Harvest {
  id: string;
  zone_id: string;
  harvest_date: string;
  quantity_kg: number;
  grade: HarvestGrade;
  notes: string | null;
  created_at: string;
  zone_name?: string;
}

export interface DashboardSummary {
  total_harvest_kg: number;
  total_revenue: number;
  total_expenses: number;
  active_tasks: number;
  worker_count: number;
  low_stock_items: number;
}

export interface TrendPoint {
  month: string;
  value: number;
}

export interface FinanceTrendPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type ZoneStatus = 'active' | 'dormant' | 'replanting';
export type WorkerRole = 'supervisor' | 'field_worker' | 'seasonal';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'pruning' | 'fertilizing' | 'irrigation' | 'harvest' | 'pest_control' | 'general';
export type InventoryCategory = 'fertilizer' | 'pesticide' | 'tool' | 'packaging' | 'seed' | 'other';
export type TransactionType = 'expense' | 'revenue';
export type TransactionCategory = 'labor' | 'supplies' | 'equipment' | 'sales' | 'transport' | 'other';
export type HarvestGrade = 'A' | 'B' | 'C';
