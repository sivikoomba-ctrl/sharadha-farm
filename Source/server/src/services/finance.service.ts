import crypto from 'crypto';
import db from '../config/db';
import { Transaction } from '../../../shared/types';
import { CreateTransactionInput, UpdateTransactionInput } from '../validators/finance.validator';

const TABLE = 'transactions';

interface FinanceFilters {
  type?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  offset?: number;
  limit?: number;
}

export async function getAll(filters: FinanceFilters = {}) {
  const { offset = 0, limit = 20, type, category, start_date, end_date } = filters;

  function applyFilters(query: any) {
    if (type) query.where('transactions.type', type);
    if (category) query.where('transactions.category', category);
    if (start_date) query.where('transactions.transaction_date', '>=', start_date);
    if (end_date) query.where('transactions.transaction_date', '<=', end_date);
    return query;
  }

  const countQuery = applyFilters(db(TABLE));
  const [{ count }] = await countQuery.count('id as count');
  const total = Number(count);

  const dataQuery = applyFilters(
    db(TABLE)
      .select(
        'transactions.*',
        'workers.full_name as worker_name'
      )
      .leftJoin('workers', 'transactions.worker_id', 'workers.id')
  );

  const data: Transaction[] = await dataQuery
    .orderBy('transactions.transaction_date', 'desc')
    .offset(offset)
    .limit(limit);

  return { data, total };
}

export async function getById(id: string): Promise<Transaction | undefined> {
  return db(TABLE)
    .select('transactions.*', 'workers.full_name as worker_name')
    .leftJoin('workers', 'transactions.worker_id', 'workers.id')
    .where('transactions.id', id)
    .first();
}

export async function create(data: CreateTransactionInput): Promise<Transaction> {
  const id = crypto.randomUUID();
  await db(TABLE).insert({ ...data, id });
  return getById(id) as Promise<Transaction>;
}

export async function update(id: string, data: UpdateTransactionInput): Promise<Transaction | undefined> {
  await db(TABLE).where({ id }).update({ ...data, updated_at: new Date().toISOString() });
  return getById(id);
}

export async function remove(id: string): Promise<Transaction | undefined> {
  const transaction = await getById(id);
  await db(TABLE).where({ id }).delete();
  return transaction;
}

interface SummaryFilters {
  start_date?: string;
  end_date?: string;
}

export async function getSummary(filters: SummaryFilters = {}) {
  const { start_date, end_date } = filters;

  const query = db(TABLE)
    .select('type', 'category')
    .sum('amount as total')
    .groupBy('type', 'category');

  if (start_date) query.where('transaction_date', '>=', start_date);
  if (end_date) query.where('transaction_date', '<=', end_date);

  const rows = await query;

  const summary = {
    revenue: { total: 0, by_category: {} as Record<string, number> },
    expense: { total: 0, by_category: {} as Record<string, number> },
  };

  for (const row of rows) {
    const type = row.type as 'revenue' | 'expense';
    const amount = Number(row.total);
    summary[type].total += amount;
    summary[type].by_category[row.category] = amount;
  }

  return summary;
}
