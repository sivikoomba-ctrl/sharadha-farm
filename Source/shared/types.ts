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

export type ProjectType = 'poly_house' | 'open_field';
export type SubsidyStatus = 'active' | 'completed' | 'cancelled';
export type SubsidyStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SubsidyDocCategory = 'application' | 'bank';
export type SubsidyDocKey =
  | 'dpr'
  | 'rtc_ec'
  | 'noc_co_owner'
  | 'site_map'
  | 'aadhaar'
  | 'pan_or_voter'
  | 'undertaking'
  | 'tech_standards'
  | 'basic_data_sheet'
  | 'firm_registration'
  | 'caste_certificate'
  | 'applicant_photo'
  | 'bank_appraisal'
  | 'loan_sanction'
  | 'legal_search'
  | 'pre_inspection';
export type SubsidyEventType = 'entered' | 'completed' | 'note';

export interface SubsidyApplication {
  id: string;
  applicant_name: string;
  family_id: string | null;
  project_type: ProjectType;
  subsidy_cap_inr: number;
  current_stage: SubsidyStage;
  status: SubsidyStatus;
  consultant_name: string | null;
  consultant_phone: string | null;
  consultant_email: string | null;
  notes: string | null;
  dpr_submission_date: string | null;
  bank_sanction_date: string | null;
  online_application_date: string | null;
  goc_date: string | null;
  first_term_loan_release_date: string | null;
  project_completion_date: string | null;
  subsidy_claim_date: string | null;
  subsidy_received_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubsidyDocument {
  id: string;
  application_id: string;
  doc_key: SubsidyDocKey;
  category: SubsidyDocCategory;
  is_uploaded: boolean;
  is_notarized: boolean;
  is_translated: boolean;
  file_url: string | null;
  submitted_date: string | null;
  notes: string | null;
}

export interface SubsidyStageEvent {
  id: string;
  application_id: string;
  stage: SubsidyStage;
  event_type: SubsidyEventType;
  event_date: string;
  notes: string | null;
  created_at: string;
}

export interface SubsidyDeadlines {
  originals_due_date: string | null;
  completion_deadline: string | null;
  claim_deadline: string | null;
  originals_days_remaining: number | null;
  completion_days_remaining: number | null;
  claim_days_remaining: number | null;
}

export interface SubsidyApplicationDetail extends SubsidyApplication {
  documents: SubsidyDocument[];
  stage_events: SubsidyStageEvent[];
  deadlines: SubsidyDeadlines;
}
