export const ZONE_STATUSES = ['active', 'dormant', 'replanting'] as const;

export const WORKER_ROLES = ['supervisor', 'field_worker', 'seasonal'] as const;

export const TASK_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

export const PRIORITIES = ['low', 'medium', 'high'] as const;

export const TASK_CATEGORIES = ['pruning', 'fertilizing', 'irrigation', 'harvest', 'pest_control', 'general'] as const;

export const INVENTORY_CATEGORIES = ['fertilizer', 'pesticide', 'tool', 'packaging', 'seed', 'other'] as const;

export const TRANSACTION_TYPES = ['expense', 'revenue'] as const;

export const TRANSACTION_CATEGORIES = ['labor', 'supplies', 'equipment', 'sales', 'transport', 'other'] as const;

export const HARVEST_GRADES = ['A', 'B', 'C'] as const;

export const UNITS = ['kg', 'liters', 'units', 'bags'] as const;

export const BLUEBERRY_VARIETIES = ['Duke', 'Bluecrop', 'Jersey', 'Chandler', 'Elliot', 'Legacy', 'Patriot'] as const;

export const PROJECT_TYPES = ['poly_house', 'open_field'] as const;
export const SUBSIDY_STATUSES = ['active', 'completed', 'cancelled'] as const;
export const SUBSIDY_STAGES = [1, 2, 3, 4, 5, 6, 7] as const;

export const SUBSIDY_CAPS_INR: Record<'poly_house' | 'open_field', number> = {
  poly_house: 5600000,
  open_field: 3000000,
};

export const SUBSIDY_APPLICATION_DOCS = [
  'dpr',
  'rtc_ec',
  'noc_co_owner',
  'site_map',
  'aadhaar',
  'pan_or_voter',
  'undertaking',
  'tech_standards',
  'basic_data_sheet',
  'firm_registration',
  'caste_certificate',
  'applicant_photo',
] as const;

export const SUBSIDY_BANK_DOCS = [
  'bank_appraisal',
  'loan_sanction',
  'legal_search',
  'pre_inspection',
] as const;

export const SUBSIDY_DOC_KEYS = [
  ...SUBSIDY_APPLICATION_DOCS,
  ...SUBSIDY_BANK_DOCS,
] as const;
