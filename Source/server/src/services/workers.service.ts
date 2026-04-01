import crypto from 'crypto';
import db from '../config/db';
import { Worker, Task } from '../../../shared/types';
import { CreateWorkerInput, UpdateWorkerInput } from '../validators/worker.validator';

const TABLE = 'workers';

interface WorkerFilters {
  role?: string;
  is_active?: boolean;
}

export async function getAll(filters: WorkerFilters = {}): Promise<Worker[]> {
  const query = db(TABLE).select('*');
  if (filters.role) query.where('role', filters.role);
  if (filters.is_active !== undefined) query.where('is_active', filters.is_active);
  return query.orderBy('full_name', 'asc');
}

export async function getById(id: string): Promise<(Worker & { tasks: Task[] }) | undefined> {
  const worker = await db(TABLE).where({ id }).first();
  if (!worker) return undefined;

  const tasks = await db('tasks')
    .where('assigned_to', id)
    .whereIn('status', ['pending', 'in_progress'])
    .orderBy('due_date', 'asc');

  return { ...worker, tasks };
}

export async function create(data: CreateWorkerInput): Promise<Worker> {
  const id = crypto.randomUUID();
  await db(TABLE).insert({ ...data, id });
  return getById(id) as Promise<Worker>;
}

export async function update(id: string, data: UpdateWorkerInput): Promise<Worker | undefined> {
  await db(TABLE).where({ id }).update({ ...data, updated_at: new Date().toISOString() });
  return getById(id);
}

export async function remove(id: string): Promise<Worker | undefined> {
  await db(TABLE)
    .where({ id })
    .update({ is_active: false, updated_at: new Date().toISOString() });
  return getById(id);
}
