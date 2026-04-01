import { z } from 'zod';

export const createWorkerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone: z.string().min(1),
  role: z.enum(['supervisor', 'field_worker', 'seasonal']),
  daily_wage: z.number().positive('Daily wage must be a positive number'),
  is_active: z.boolean(),
  joined_date: z.string().min(1, 'Joined date is required'),
});

export const updateWorkerSchema = createWorkerSchema.partial();

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
