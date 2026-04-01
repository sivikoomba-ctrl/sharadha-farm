import crypto from 'crypto';
import db from '../config/db';
import { Task } from '../../../shared/types';
import { CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput } from '../validators/task.validator';

const TABLE = 'tasks';

interface TaskFilters {
  status?: string;
  zone_id?: string;
  assigned_to?: string;
  offset?: number;
  limit?: number;
}

export async function getAll(filters: TaskFilters = {}) {
  const { offset = 0, limit = 20, ...where } = filters;

  const baseQuery = db(TABLE)
    .leftJoin('zones', 'tasks.zone_id', 'zones.id')
    .leftJoin('workers', 'tasks.assigned_to', 'workers.id');

  const countQuery = baseQuery.clone();
  if (where.status) countQuery.where('tasks.status', where.status);
  if (where.zone_id) countQuery.where('tasks.zone_id', where.zone_id);
  if (where.assigned_to) countQuery.where('tasks.assigned_to', where.assigned_to);

  const [{ count }] = await countQuery.count('tasks.id as count');
  const total = Number(count);

  const dataQuery = db(TABLE)
    .select(
      'tasks.*',
      'zones.name as zone_name',
      'workers.full_name as worker_name'
    )
    .leftJoin('zones', 'tasks.zone_id', 'zones.id')
    .leftJoin('workers', 'tasks.assigned_to', 'workers.id');

  if (where.status) dataQuery.where('tasks.status', where.status);
  if (where.zone_id) dataQuery.where('tasks.zone_id', where.zone_id);
  if (where.assigned_to) dataQuery.where('tasks.assigned_to', where.assigned_to);

  const data: Task[] = await dataQuery
    .orderBy('tasks.due_date', 'asc')
    .offset(offset)
    .limit(limit);

  return { data, total };
}

export async function getById(id: string): Promise<Task | undefined> {
  return db(TABLE)
    .select(
      'tasks.*',
      'zones.name as zone_name',
      'workers.full_name as worker_name'
    )
    .leftJoin('zones', 'tasks.zone_id', 'zones.id')
    .leftJoin('workers', 'tasks.assigned_to', 'workers.id')
    .where('tasks.id', id)
    .first();
}

export async function create(data: CreateTaskInput): Promise<Task> {
  const id = crypto.randomUUID();
  await db(TABLE).insert({ ...data, id });
  return getById(id) as Promise<Task>;
}

export async function update(id: string, data: UpdateTaskInput): Promise<Task | undefined> {
  await db(TABLE).where({ id }).update({ ...data, updated_at: new Date().toISOString() });
  return getById(id);
}

export async function updateStatus(id: string, data: UpdateTaskStatusInput): Promise<Task | undefined> {
  const updateData: Record<string, unknown> = {
    status: data.status,
    updated_at: new Date().toISOString(),
  };
  if (data.status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }
  await db(TABLE).where({ id }).update(updateData);
  return getById(id);
}

export async function remove(id: string): Promise<Task | undefined> {
  const task = await getById(id);
  await db(TABLE).where({ id }).delete();
  return task;
}
