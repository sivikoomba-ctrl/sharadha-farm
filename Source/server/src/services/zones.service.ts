import crypto from 'crypto';
import db from '../config/db';
import { Zone } from '../../../shared/types';
import { CreateZoneInput, UpdateZoneInput } from '../validators/zone.validator';

const TABLE = 'zones';

export async function getAll(): Promise<Zone[]> {
  return db(TABLE).select('*').orderBy('name', 'asc');
}

export async function getById(id: string): Promise<Zone | undefined> {
  return db(TABLE).where({ id }).first();
}

export async function create(data: CreateZoneInput): Promise<Zone> {
  const id = crypto.randomUUID();
  await db(TABLE).insert({ ...data, id });
  return getById(id) as Promise<Zone>;
}

export async function update(id: string, data: UpdateZoneInput): Promise<Zone | undefined> {
  await db(TABLE).where({ id }).update({ ...data, updated_at: new Date().toISOString() });
  return getById(id);
}

export async function remove(id: string): Promise<Zone | undefined> {
  await db(TABLE)
    .where({ id })
    .update({ status: 'dormant', updated_at: new Date().toISOString() });
  return getById(id);
}
