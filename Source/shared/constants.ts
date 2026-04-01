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
