import axiosClient from '@/api/axiosClient';
import type {
  SubsidyApplication,
  SubsidyApplicationDetail,
  SubsidyDocument,
  SubsidyDocKey,
} from '@shared/types';

export interface CreateSubsidyApplicationInput {
  applicant_name: string;
  family_id?: string | null;
  project_type: 'poly_house' | 'open_field';
  consultant_name?: string | null;
  consultant_phone?: string | null;
  consultant_email?: string | null;
  notes?: string | null;
}

export interface UpdateSubsidyApplicationInput {
  applicant_name?: string;
  family_id?: string | null;
  project_type?: 'poly_house' | 'open_field';
  status?: 'active' | 'completed' | 'cancelled';
  consultant_name?: string | null;
  consultant_phone?: string | null;
  consultant_email?: string | null;
  notes?: string | null;
  dpr_submission_date?: string | null;
  bank_sanction_date?: string | null;
  online_application_date?: string | null;
  goc_date?: string | null;
  first_term_loan_release_date?: string | null;
  project_completion_date?: string | null;
  subsidy_claim_date?: string | null;
  subsidy_received_date?: string | null;
}

export interface UpdateSubsidyDocumentInput {
  is_uploaded?: boolean;
  is_notarized?: boolean;
  is_translated?: boolean;
  file_url?: string | null;
  submitted_date?: string | null;
  notes?: string | null;
}

export interface AdvanceStageInput {
  stage: number;
  event_date: string;
  notes?: string | null;
}

export async function fetchSubsidyApplications(): Promise<SubsidyApplication[]> {
  const res = await axiosClient.get('/subsidy-applications');
  return res.data.data;
}

export async function fetchActiveSubsidy(): Promise<SubsidyApplicationDetail | null> {
  const res = await axiosClient.get('/subsidy-applications/active');
  return res.data.data;
}

export async function fetchSubsidyById(id: string): Promise<SubsidyApplicationDetail> {
  const res = await axiosClient.get(`/subsidy-applications/${id}`);
  return res.data.data;
}

export async function createSubsidyApplication(
  input: CreateSubsidyApplicationInput,
): Promise<SubsidyApplicationDetail> {
  const res = await axiosClient.post('/subsidy-applications', input);
  return res.data.data;
}

export async function updateSubsidyApplication(
  id: string,
  input: UpdateSubsidyApplicationInput,
): Promise<SubsidyApplicationDetail> {
  const res = await axiosClient.patch(`/subsidy-applications/${id}`, input);
  return res.data.data;
}

export async function deleteSubsidyApplication(id: string): Promise<void> {
  await axiosClient.delete(`/subsidy-applications/${id}`);
}

export async function updateSubsidyDocument(
  applicationId: string,
  docKey: SubsidyDocKey,
  input: UpdateSubsidyDocumentInput,
): Promise<SubsidyDocument> {
  const res = await axiosClient.patch(
    `/subsidy-applications/${applicationId}/documents/${docKey}`,
    input,
  );
  return res.data.data;
}

export async function advanceSubsidyStage(
  applicationId: string,
  input: AdvanceStageInput,
): Promise<SubsidyApplicationDetail> {
  const res = await axiosClient.post(
    `/subsidy-applications/${applicationId}/advance-stage`,
    input,
  );
  return res.data.data;
}
