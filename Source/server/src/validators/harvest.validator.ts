import { z } from 'zod';

export const createHarvestSchema = z.object({
  zone_id: z.string().uuid('Valid zone ID is required'),
  harvest_date: z.string().min(1, 'Harvest date is required').date('Invalid date format (expected YYYY-MM-DD)'),
  quantity_kg: z.number().positive('Quantity must be a positive number'),
  grade: z.enum(['A', 'B', 'C']),
  notes: z.string().nullable().optional(),
});

export const updateHarvestSchema = createHarvestSchema.partial();

export type CreateHarvestInput = z.infer<typeof createHarvestSchema>;
export type UpdateHarvestInput = z.infer<typeof updateHarvestSchema>;
