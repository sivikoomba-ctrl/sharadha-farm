import crypto from 'crypto';
import db from '../config/db';
import { InventoryItem } from '../../../shared/types';
import { CreateInventoryInput, UpdateInventoryInput } from '../validators/inventory.validator';

const TABLE = 'inventory_items';

interface InventoryFilters {
  category?: string;
  low_stock?: boolean;
  offset?: number;
  limit?: number;
}

export async function getAll(filters: InventoryFilters = {}) {
  const { offset = 0, limit = 20, category, low_stock } = filters;

  const baseQuery = db(TABLE);
  if (category) baseQuery.where('category', category);
  if (low_stock) baseQuery.whereRaw('quantity < reorder_level');

  const countQuery = baseQuery.clone();
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const data: InventoryItem[] = await baseQuery
    .clone()
    .select('*')
    .orderBy('name', 'asc')
    .offset(offset)
    .limit(limit);

  return { data, total };
}

export async function getById(id: string): Promise<InventoryItem | undefined> {
  return db(TABLE).where({ id }).first();
}

export async function create(data: CreateInventoryInput): Promise<InventoryItem> {
  const id = crypto.randomUUID();
  await db(TABLE).insert({ ...data, id });
  return getById(id) as Promise<InventoryItem>;
}

export async function update(id: string, data: UpdateInventoryInput): Promise<InventoryItem | undefined> {
  await db(TABLE).where({ id }).update({ ...data, updated_at: new Date().toISOString() });
  return getById(id);
}

export async function remove(id: string): Promise<InventoryItem | undefined> {
  const item = await getById(id);
  await db(TABLE).where({ id }).delete();
  return item;
}
