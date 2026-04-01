import { z } from 'zod';

export const createInventorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(150),
  category: z.enum(['fertilizer', 'pesticide', 'tool', 'packaging', 'seed', 'other']),
  quantity: z.number().min(0, 'Quantity must be >= 0'),
  unit: z.string().min(1),
  reorder_level: z.number().min(0, 'Reorder level must be >= 0'),
  unit_cost: z.number().min(0, 'Unit cost must be >= 0'),
  location: z.string().min(1),
});

export const updateInventorySchema = createInventorySchema.partial();

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
