import { z } from 'zod';

export const createZoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  area_hectares: z.number().positive('Area must be a positive number'),
  variety: z.string().min(1),
  planting_date: z.string().min(1, 'Planting date is required'),
  status: z.enum(['active', 'dormant', 'replanting']),
  notes: z.string().nullable().optional(),
});

export const updateZoneSchema = createZoneSchema.partial();

export type CreateZoneInput = z.infer<typeof createZoneSchema>;
export type UpdateZoneInput = z.infer<typeof updateZoneSchema>;
