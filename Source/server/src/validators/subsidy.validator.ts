import { z } from 'zod';
import { PROJECT_TYPES, SUBSIDY_DOC_KEYS, SUBSIDY_STATUSES } from '../../../shared/constants';

const dateOrEmpty = z.string().optional().nullable().refine(
  (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
  { message: 'Invalid date format (expected YYYY-MM-DD)' },
);

export const createApplicationSchema = z.object({
  applicant_name: z.string().min(1, 'Applicant name is required'),
  family_id: z.string().optional().nullable(),
  project_type: z.enum(PROJECT_TYPES),
  consultant_name: z.string().optional().nullable(),
  consultant_phone: z.string().optional().nullable(),
  consultant_email: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateApplicationSchema = z.object({
  applicant_name: z.string().min(1).optional(),
  family_id: z.string().optional().nullable(),
  project_type: z.enum(PROJECT_TYPES).optional(),
  status: z.enum(SUBSIDY_STATUSES).optional(),
  consultant_name: z.string().optional().nullable(),
  consultant_phone: z.string().optional().nullable(),
  consultant_email: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  dpr_submission_date: dateOrEmpty,
  bank_sanction_date: dateOrEmpty,
  online_application_date: dateOrEmpty,
  goc_date: dateOrEmpty,
  first_term_loan_release_date: dateOrEmpty,
  project_completion_date: dateOrEmpty,
  subsidy_claim_date: dateOrEmpty,
  subsidy_received_date: dateOrEmpty,
});

export const updateDocumentSchema = z.object({
  is_uploaded: z.boolean().optional(),
  is_notarized: z.boolean().optional(),
  is_translated: z.boolean().optional(),
  file_url: z.string().optional().nullable(),
  submitted_date: dateOrEmpty,
  notes: z.string().optional().nullable(),
});

export const advanceStageSchema = z.object({
  stage: z.number().int().min(1).max(7),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (expected YYYY-MM-DD)'),
  notes: z.string().optional().nullable(),
});

export const docKeySchema = z.enum(SUBSIDY_DOC_KEYS);

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type AdvanceStageInput = z.infer<typeof advanceStageSchema>;
