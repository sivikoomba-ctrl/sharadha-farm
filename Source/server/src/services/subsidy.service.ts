import crypto from 'crypto';
import db from '../config/db';
import {
  SubsidyApplication,
  SubsidyApplicationDetail,
  SubsidyDocument,
  SubsidyStageEvent,
  SubsidyDeadlines,
  SubsidyStage,
  SubsidyDocKey,
} from '../../../shared/types';
import {
  SUBSIDY_APPLICATION_DOCS,
  SUBSIDY_BANK_DOCS,
  SUBSIDY_CAPS_INR,
} from '../../../shared/constants';
import {
  CreateApplicationInput,
  UpdateApplicationInput,
  UpdateDocumentInput,
  AdvanceStageInput,
} from '../validators/subsidy.validator';

const APPS = 'subsidy_applications';
const DOCS = 'subsidy_documents';
const EVENTS = 'subsidy_stage_events';

const STAGE_DATE_COLUMNS: Partial<Record<SubsidyStage, keyof SubsidyApplication>> = {
  1: 'dpr_submission_date',
  2: 'bank_sanction_date',
  3: 'online_application_date',
  4: 'goc_date',
  5: 'first_term_loan_release_date',
  6: 'project_completion_date',
  7: 'subsidy_claim_date',
};

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function computeDeadlines(app: SubsidyApplication): SubsidyDeadlines {
  const today = new Date().toISOString().slice(0, 10);

  const originals_due_date = app.online_application_date
    ? addDays(app.online_application_date, 7)
    : null;
  const completion_deadline = app.first_term_loan_release_date
    ? addMonths(app.first_term_loan_release_date, 18)
    : null;
  const claim_deadline = app.project_completion_date
    ? addMonths(app.project_completion_date, 3)
    : null;

  return {
    originals_due_date,
    completion_deadline,
    claim_deadline,
    originals_days_remaining: originals_due_date ? daysBetween(today, originals_due_date) : null,
    completion_days_remaining: completion_deadline ? daysBetween(today, completion_deadline) : null,
    claim_days_remaining: claim_deadline ? daysBetween(today, claim_deadline) : null,
  };
}

async function seedDocuments(applicationId: string): Promise<void> {
  const rows = [
    ...SUBSIDY_APPLICATION_DOCS.map((doc_key) => ({
      id: crypto.randomUUID(),
      application_id: applicationId,
      doc_key,
      category: 'application',
      is_uploaded: false,
      is_notarized: false,
      is_translated: false,
    })),
    ...SUBSIDY_BANK_DOCS.map((doc_key) => ({
      id: crypto.randomUUID(),
      application_id: applicationId,
      doc_key,
      category: 'bank',
      is_uploaded: false,
      is_notarized: false,
      is_translated: false,
    })),
  ];
  await db(DOCS).insert(rows);
}

async function backfillMissingDocuments(applicationId: string): Promise<void> {
  const existing = await db(DOCS).where({ application_id: applicationId }).select('doc_key');
  const have = new Set(existing.map((r) => r.doc_key));
  const toInsert: Array<{ id: string; application_id: string; doc_key: string; category: string; is_uploaded: boolean; is_notarized: boolean; is_translated: boolean }> = [];
  for (const doc_key of SUBSIDY_APPLICATION_DOCS) {
    if (!have.has(doc_key)) {
      toInsert.push({ id: crypto.randomUUID(), application_id: applicationId, doc_key, category: 'application', is_uploaded: false, is_notarized: false, is_translated: false });
    }
  }
  for (const doc_key of SUBSIDY_BANK_DOCS) {
    if (!have.has(doc_key)) {
      toInsert.push({ id: crypto.randomUUID(), application_id: applicationId, doc_key, category: 'bank', is_uploaded: false, is_notarized: false, is_translated: false });
    }
  }
  if (toInsert.length > 0) await db(DOCS).insert(toInsert);
}

export async function getAll(): Promise<SubsidyApplication[]> {
  return db(APPS).select('*').orderBy('created_at', 'desc');
}

export async function getActive(): Promise<SubsidyApplication | undefined> {
  return db(APPS).where({ status: 'active' }).orderBy('created_at', 'desc').first();
}

export async function getById(id: string): Promise<SubsidyApplicationDetail | null> {
  const app: SubsidyApplication | undefined = await db(APPS).where({ id }).first();
  if (!app) return null;

  await backfillMissingDocuments(id);

  const documents: SubsidyDocument[] = await db(DOCS).where({ application_id: id }).orderBy('category').orderBy('doc_key');
  const stage_events: SubsidyStageEvent[] = await db(EVENTS).where({ application_id: id }).orderBy('event_date', 'desc');

  return {
    ...app,
    documents,
    stage_events,
    deadlines: computeDeadlines(app),
  };
}

export async function create(input: CreateApplicationInput): Promise<SubsidyApplicationDetail> {
  const id = crypto.randomUUID();
  const today = new Date().toISOString().slice(0, 10);
  const subsidy_cap_inr = SUBSIDY_CAPS_INR[input.project_type];

  await db(APPS).insert({
    id,
    applicant_name: input.applicant_name,
    family_id: input.family_id ?? null,
    project_type: input.project_type,
    subsidy_cap_inr,
    current_stage: 1,
    status: 'active',
    consultant_name: input.consultant_name ?? null,
    consultant_phone: input.consultant_phone ?? null,
    consultant_email: input.consultant_email ?? null,
    notes: input.notes ?? null,
  });

  await seedDocuments(id);

  await db(EVENTS).insert({
    id: crypto.randomUUID(),
    application_id: id,
    stage: 1,
    event_type: 'entered',
    event_date: today,
    notes: 'Application created',
  });

  const detail = await getById(id);
  if (!detail) throw new Error('Failed to create subsidy application');
  return detail;
}

export async function update(id: string, input: UpdateApplicationInput): Promise<SubsidyApplicationDetail | null> {
  const existing: SubsidyApplication | undefined = await db(APPS).where({ id }).first();
  if (!existing) return null;

  const patch: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };

  // Recompute subsidy cap if project type changes
  if (input.project_type && input.project_type !== existing.project_type) {
    patch.subsidy_cap_inr = SUBSIDY_CAPS_INR[input.project_type];
  }

  // Stage 5 (Term Loan Release) requires Stage 4 (GoC) — load-bearing rule
  const newGocDate = input.goc_date ?? existing.goc_date;
  const newReleaseDate = input.first_term_loan_release_date ?? existing.first_term_loan_release_date;
  if (newReleaseDate && !newGocDate) {
    throw new Error('Cannot set term loan release date before GoC date is recorded (Stage 4 must complete first)');
  }

  await db(APPS).where({ id }).update(patch);
  return getById(id);
}

export async function remove(id: string): Promise<boolean> {
  const deleted = await db(APPS).where({ id }).delete();
  return deleted > 0;
}

export async function updateDocument(
  applicationId: string,
  docKey: SubsidyDocKey,
  input: UpdateDocumentInput,
): Promise<SubsidyDocument | null> {
  const row: SubsidyDocument | undefined = await db(DOCS)
    .where({ application_id: applicationId, doc_key: docKey })
    .first();
  if (!row) return null;
  await db(DOCS).where({ id: row.id }).update(input);
  return db(DOCS).where({ id: row.id }).first();
}

export async function advanceStage(
  applicationId: string,
  input: AdvanceStageInput,
): Promise<SubsidyApplicationDetail | null> {
  const app: SubsidyApplication | undefined = await db(APPS).where({ id: applicationId }).first();
  if (!app) return null;

  const newStage = input.stage as SubsidyStage;

  // Enforce: stage 5 requires stage 4 done (GoC date set)
  if (newStage >= 5 && !app.goc_date && newStage !== 4) {
    throw new Error('Cannot advance to Stage 5+ without GoC date (Stage 4 must complete first)');
  }

  const dateColumn = STAGE_DATE_COLUMNS[newStage];
  const patch: Record<string, unknown> = {
    current_stage: newStage,
    updated_at: new Date().toISOString(),
  };
  if (dateColumn) patch[dateColumn] = input.event_date;

  // Mark application complete after stage 7 (subsidy received) — keep as 'active' until subsidy_received_date is set
  if (newStage === 7 && app.subsidy_received_date) {
    patch.status = 'completed';
  }

  await db(APPS).where({ id: applicationId }).update(patch);

  await db(EVENTS).insert({
    id: crypto.randomUUID(),
    application_id: applicationId,
    stage: newStage,
    event_type: 'entered',
    event_date: input.event_date,
    notes: input.notes ?? null,
  });

  return getById(applicationId);
}
