import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { FileCheck, Check, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import {
  fetchActiveSubsidy,
  createSubsidyApplication,
  updateSubsidyApplication,
  updateSubsidyDocument,
  advanceSubsidyStage,
} from '@/api/subsidy';
import PageHeader from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import {
  PROJECT_TYPES,
  SUBSIDY_APPLICATION_DOCS,
  SUBSIDY_BANK_DOCS,
  SUBSIDY_CAPS_INR,
} from '@shared/constants';
import type {
  SubsidyApplicationDetail,
  SubsidyDocument,
  SubsidyDocKey,
  SubsidyStage,
} from '@shared/types';

const TAB_KEYS = ['documents', 'stages', 'timeline', 'notes'] as const;
type TabKey = typeof TAB_KEYS[number];

const STAGE_DATE_FIELDS: Record<SubsidyStage, keyof SubsidyApplicationDetail | null> = {
  1: 'dpr_submission_date',
  2: 'bank_sanction_date',
  3: 'online_application_date',
  4: 'goc_date',
  5: 'first_term_loan_release_date',
  6: 'project_completion_date',
  7: 'subsidy_claim_date',
};

const createSchema = z.object({
  applicant_name: z.string().min(1, 'Required'),
  family_id: z.string().optional(),
  project_type: z.enum(PROJECT_TYPES),
  consultant_name: z.string().optional(),
  consultant_phone: z.string().optional(),
  consultant_email: z.string().optional(),
  notes: z.string().optional(),
});
type CreateFormData = z.infer<typeof createSchema>;

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return format(new Date(iso), 'dd MMM yyyy');
}

export default function SubsidyPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabKey>('documents');

  const { data: app, isLoading } = useQuery({
    queryKey: ['subsidy-active'],
    queryFn: fetchActiveSubsidy,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner />
      </div>
    );
  }

  if (!app) {
    return <CreateApplicationView />;
  }

  return (
    <div>
      <PageHeader title={t('subsidy.title')} />

      <ApplicationHeader app={app} />
      <DeadlineBar app={app} />
      <StageStepper app={app} />

      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {TAB_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                tab === k
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {t(`subsidy.tabs.${k}`)}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tab === 'documents' && <DocumentsTab app={app} />}
        {tab === 'stages' && <StagesTab app={app} />}
        {tab === 'timeline' && <TimelineTab app={app} />}
        {tab === 'notes' && <NotesTab app={app} />}
      </div>

      <div className="mt-8 rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
        <strong>{t('subsidy.consultantNotice.title')}:</strong>{' '}
        {t('subsidy.consultantNotice.body')}
      </div>
    </div>
  );
}

function CreateApplicationView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { project_type: 'poly_house' },
  });

  const createMutation = useMutation({
    mutationFn: createSubsidyApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-active'] });
      toast.success(t('subsidy.created'));
    },
    onError: (e: Error) => toast.error(e.message || t('subsidy.createFailed')),
  });

  function onSubmit(data: CreateFormData) {
    createMutation.mutate({
      applicant_name: data.applicant_name,
      family_id: data.family_id || null,
      project_type: data.project_type,
      consultant_name: data.consultant_name || null,
      consultant_phone: data.consultant_phone || null,
      consultant_email: data.consultant_email || null,
      notes: data.notes || null,
    });
  }

  return (
    <div>
      <PageHeader title={t('subsidy.title')} />
      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start gap-3">
          <FileCheck className="mt-0.5 h-6 w-6 text-indigo-600 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">{t('subsidy.startTitle')}</h2>
            <p className="text-sm text-gray-600">{t('subsidy.startSubtitle')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('subsidy.fields.applicantName')}
              </label>
              <input
                {...register('applicant_name')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.applicant_name && (
                <p className="mt-1 text-xs text-red-600">{errors.applicant_name.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('subsidy.fields.familyId')}
              </label>
              <input
                {...register('family_id')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('subsidy.fields.projectType')}
            </label>
            <select
              {...register('project_type')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {PROJECT_TYPES.map((p) => (
                <option key={p} value={p}>
                  {t(`subsidy.projectType.${p}`)} — {formatINR(SUBSIDY_CAPS_INR[p])}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="rounded-lg border border-gray-200 p-4">
            <legend className="px-2 text-sm font-medium text-gray-700">
              {t('subsidy.fields.consultantSection')}
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                {...register('consultant_name')}
                placeholder={t('subsidy.fields.consultantName')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                {...register('consultant_phone')}
                placeholder={t('subsidy.fields.consultantPhone')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                {...register('consultant_email')}
                placeholder={t('subsidy.fields.consultantEmail')}
                className="sm:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </fieldset>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('common.notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
          >
            {createMutation.isPending ? t('common.saving') : t('subsidy.createBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}

function ApplicationHeader({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t('subsidy.applicantLabel')}
          </div>
          <div className="mt-1 text-xl font-semibold">{app.applicant_name}</div>
          {app.family_id && (
            <div className="mt-0.5 text-sm text-gray-500">
              {t('subsidy.fields.familyId')}: {app.family_id}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {t(`subsidy.projectType.${app.project_type}`)}
          </div>
          <div className="mt-1 text-lg font-semibold text-indigo-600">
            {formatINR(app.subsidy_cap_inr)}
          </div>
          <div className="text-xs text-gray-500">{t('subsidy.subsidyCap')}</div>
        </div>
      </div>
    </div>
  );
}

function DeadlineBar({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  const { deadlines } = app;

  const items = [
    {
      label: t('subsidy.deadlines.originals'),
      date: deadlines.originals_due_date,
      days: deadlines.originals_days_remaining,
    },
    {
      label: t('subsidy.deadlines.completion'),
      date: deadlines.completion_deadline,
      days: deadlines.completion_days_remaining,
    },
    {
      label: t('subsidy.deadlines.claim'),
      date: deadlines.claim_deadline,
      days: deadlines.claim_days_remaining,
    },
  ];

  if (items.every((i) => !i.date)) return null;

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => {
        if (!item.date) {
          return (
            <div key={item.label} className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-xs text-gray-500">
              {item.label} — {t('subsidy.deadlines.notStarted')}
            </div>
          );
        }
        const overdue = item.days !== null && item.days < 0;
        const urgent = item.days !== null && item.days >= 0 && item.days <= 14;
        const tone = overdue
          ? 'bg-red-50 border-red-200 text-red-800'
          : urgent
          ? 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800';
        const Icon = overdue ? AlertTriangle : urgent ? Clock : Check;
        return (
          <div key={item.label} className={`rounded-lg border p-3 text-sm ${tone}`}>
            <div className="flex items-center gap-2 font-medium">
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </div>
            <div className="mt-1 text-xs">
              {formatDate(item.date)} ·{' '}
              {overdue
                ? t('subsidy.deadlines.overdueBy', { days: Math.abs(item.days!) })
                : t('subsidy.deadlines.daysLeft', { days: item.days })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StageStepper({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  const stages: SubsidyStage[] = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex min-w-max items-center gap-2">
        {stages.map((s, i) => {
          const reached = app.current_stage >= s;
          const current = app.current_stage === s;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${
                  current
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : reached
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {reached && !current ? <Check className="h-4 w-4" /> : s}
              </div>
              <span
                className={`text-xs ${current ? 'font-semibold text-indigo-700' : reached ? 'text-emerald-700' : 'text-gray-500'}`}
              >
                {t(`subsidy.stage.${s}`)}
              </span>
              {i < stages.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocumentsTab({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ docKey, patch }: { docKey: SubsidyDocKey; patch: Parameters<typeof updateSubsidyDocument>[2] }) =>
      updateSubsidyDocument(app.id, docKey, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subsidy-active'] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const docByKey = new Map<SubsidyDocKey, SubsidyDocument>(
    app.documents.map((d) => [d.doc_key, d]),
  );

  const groups = [
    { title: t('subsidy.docGroups.application'), keys: SUBSIDY_APPLICATION_DOCS },
    { title: t('subsidy.docGroups.bank'), keys: SUBSIDY_BANK_DOCS },
  ];

  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.title} className="rounded-xl border border-gray-200 bg-white">
          <h3 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold">{g.title}</h3>
          <div className="divide-y divide-gray-100">
            {g.keys.map((key) => {
              const doc = docByKey.get(key);
              if (!doc) return null;
              return (
                <DocumentRow
                  key={key}
                  doc={doc}
                  label={t(`subsidy.docs.${key}`)}
                  onToggle={(field, value) =>
                    updateMutation.mutate({ docKey: key, patch: { [field]: value } })
                  }
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function DocumentRow({
  doc,
  label,
  onToggle,
}: {
  doc: SubsidyDocument;
  label: string;
  onToggle: (field: 'is_uploaded' | 'is_notarized' | 'is_translated', value: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {doc.submitted_date && (
          <div className="text-xs text-gray-500">
            {t('subsidy.fields.submittedOn')} {formatDate(doc.submitted_date)}
          </div>
        )}
      </div>
      <label className="flex items-center gap-1.5 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={doc.is_uploaded}
          onChange={(e) => onToggle('is_uploaded', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        {t('subsidy.fields.uploaded')}
      </label>
      <label className="flex items-center gap-1.5 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={doc.is_notarized}
          onChange={(e) => onToggle('is_notarized', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        {t('subsidy.fields.notarized')}
      </label>
      <label className="flex items-center gap-1.5 text-xs text-gray-700">
        <input
          type="checkbox"
          checked={doc.is_translated}
          onChange={(e) => onToggle('is_translated', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        {t('subsidy.fields.translated')}
      </label>
    </div>
  );
}

function StagesTab({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const updateAppMutation = useMutation({
    mutationFn: (patch: Parameters<typeof updateSubsidyApplication>[1]) =>
      updateSubsidyApplication(app.id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-active'] });
      toast.success(t('subsidy.updated'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const advanceMutation = useMutation({
    mutationFn: ({ stage, event_date }: { stage: number; event_date: string }) =>
      advanceSubsidyStage(app.id, { stage, event_date }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-active'] });
      toast.success(t('subsidy.stageAdvanced'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stages: SubsidyStage[] = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-3">
      {stages.map((s) => {
        const dateField = STAGE_DATE_FIELDS[s] as keyof SubsidyApplicationDetail | null;
        const dateValue = dateField ? (app[dateField] as string | null) : null;
        const reached = app.current_stage >= s;
        return (
          <div
            key={s}
            className={`rounded-xl border p-4 ${reached ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {t('subsidy.stageLabel', { num: s })}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {t(`subsidy.stage.${s}`)}
                </div>
                <div className="mt-1 text-xs text-gray-600">
                  {t(`subsidy.stageHint.${s}`)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {dateField && (
                  <input
                    type="date"
                    value={dateValue?.slice(0, 10) ?? ''}
                    onChange={(e) =>
                      updateAppMutation.mutate({ [dateField]: e.target.value || null } as Parameters<typeof updateSubsidyApplication>[1])
                    }
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                  />
                )}
                {!reached && (
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10);
                      advanceMutation.mutate({ stage: s, event_date: today });
                    }}
                    disabled={advanceMutation.isPending}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {t('subsidy.advanceTo', { stage: s })}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Subsidy received date — completes the application */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">{t('subsidy.fields.subsidyReceived')}</div>
            <div className="text-xs text-gray-600">{t('subsidy.fields.subsidyReceivedHint')}</div>
          </div>
          <input
            type="date"
            value={app.subsidy_received_date?.slice(0, 10) ?? ''}
            onChange={(e) => updateAppMutation.mutate({ subsidy_received_date: e.target.value || null })}
            className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
          />
        </div>
      </div>
    </div>
  );
}

function TimelineTab({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  if (app.stage_events.length === 0) {
    return <div className="text-sm text-gray-500">{t('subsidy.timelineEmpty')}</div>;
  }
  return (
    <ol className="relative space-y-4 border-l-2 border-gray-200 pl-6">
      {app.stage_events.map((ev) => (
        <li key={ev.id} className="relative">
          <span className="absolute -left-[33px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-indigo-600 bg-white">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
          </span>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {t('subsidy.stageLabel', { num: ev.stage })} · {formatDate(ev.event_date)}
          </div>
          <div className="text-sm font-medium">{t(`subsidy.stage.${ev.stage}`)}</div>
          {ev.notes && <div className="mt-1 text-xs text-gray-600">{ev.notes}</div>}
        </li>
      ))}
    </ol>
  );
}

function NotesTab({ app }: { app: SubsidyApplicationDetail }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [consultantName, setConsultantName] = useState(app.consultant_name ?? '');
  const [consultantPhone, setConsultantPhone] = useState(app.consultant_phone ?? '');
  const [consultantEmail, setConsultantEmail] = useState(app.consultant_email ?? '');
  const [notes, setNotes] = useState(app.notes ?? '');

  const updateMutation = useMutation({
    mutationFn: (patch: Parameters<typeof updateSubsidyApplication>[1]) =>
      updateSubsidyApplication(app.id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-active'] });
      toast.success(t('subsidy.updated'));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function save() {
    updateMutation.mutate({
      consultant_name: consultantName || null,
      consultant_phone: consultantPhone || null,
      consultant_email: consultantEmail || null,
      notes: notes || null,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold">{t('subsidy.fields.consultantSection')}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={consultantName}
            onChange={(e) => setConsultantName(e.target.value)}
            placeholder={t('subsidy.fields.consultantName')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={consultantPhone}
            onChange={(e) => setConsultantPhone(e.target.value)}
            placeholder={t('subsidy.fields.consultantPhone')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            value={consultantEmail}
            onChange={(e) => setConsultantEmail(e.target.value)}
            placeholder={t('subsidy.fields.consultantEmail')}
            className="sm:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold">{t('common.notes')}</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={save}
        disabled={updateMutation.isPending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {updateMutation.isPending ? t('common.saving') : t('common.saveChanges')}
      </button>
    </div>
  );
}
