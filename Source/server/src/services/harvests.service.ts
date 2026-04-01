import crypto from 'crypto';
import db from '../config/db';
import { Harvest } from '../../../shared/types';
import { CreateHarvestInput, UpdateHarvestInput } from '../validators/harvest.validator';

const TABLE = 'harvests';

interface HarvestFilters {
  zone_id?: string;
  start_date?: string;
  end_date?: string;
  offset?: number;
  limit?: number;
}

export async function getAll(filters: HarvestFilters = {}) {
  const { offset = 0, limit = 20, zone_id, start_date, end_date } = filters;

  function applyFilters(query: any) {
    if (zone_id) query.where('harvests.zone_id', zone_id);
    if (start_date) query.where('harvests.harvest_date', '>=', start_date);
    if (end_date) query.where('harvests.harvest_date', '<=', end_date);
    return query;
  }

  const countQuery = applyFilters(db(TABLE));
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const dataQuery = applyFilters(
    db(TABLE)
      .select('harvests.*', 'zones.name as zone_name')
      .leftJoin('zones', 'harvests.zone_id', 'zones.id')
  );

  const data: Harvest[] = await dataQuery
    .orderBy('harvests.harvest_date', 'desc')
    .offset(offset)
    .limit(limit);

  return { data, total };
}

export async function getById(id: string): Promise<Harvest | undefined> {
  return db(TABLE)
    .select('harvests.*', 'zones.name as zone_name')
    .leftJoin('zones', 'harvests.zone_id', 'zones.id')
    .where('harvests.id', id)
    .first();
}

export async function create(data: CreateHarvestInput): Promise<Harvest> {
  const id = crypto.randomUUID();
  await db(TABLE).insert({ ...data, id });
  return getById(id) as Promise<Harvest>;
}

export async function update(id: string, data: UpdateHarvestInput): Promise<Harvest | undefined> {
  await db(TABLE).where({ id }).update({ ...data, updated_at: new Date().toISOString() });
  return getById(id);
}

export async function remove(id: string): Promise<Harvest | undefined> {
  const harvest = await getById(id);
  await db(TABLE).where({ id }).delete();
  return harvest;
}
