import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['expense', 'revenue']),
  category: z.enum(['labor', 'supplies', 'equipment', 'sales', 'transport', 'other']),
  amount: z.number().positive('Amount must be a positive number'),
  description: z.string().max(300),
  transaction_date: z.string().min(1, 'Transaction date is required').date('Invalid date format (expected YYYY-MM-DD)'),
  worker_id: z.string().uuid().nullable().optional(),
  inventory_item_id: z.string().uuid().nullable().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
