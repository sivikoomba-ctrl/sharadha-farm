import db, { isPostgres } from '../config/db';
import { DashboardSummary, TrendPoint, FinanceTrendPoint } from '../../../shared/types';

function monthExpr(column: string): string {
  return isPostgres
    ? `to_char(${column}, 'YYYY-MM')`
    : `strftime('%Y-%m', ${column})`;
}

function dateAgo12Months(): ReturnType<typeof db.raw> {
  return isPostgres
    ? db.raw("(CURRENT_DATE - interval '12 months')")
    : db.raw("date('now', '-12 months')");
}

export async function getSummary(): Promise<DashboardSummary> {
  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;

  const [harvestResult] = await db('harvests')
    .where('harvest_date', '>=', yearStart)
    .sum('quantity_kg as total');
  const total_harvest_kg = Number(harvestResult?.total) || 0;

  const [revenueResult] = await db('transactions')
    .where('type', 'revenue')
    .where('transaction_date', '>=', yearStart)
    .sum('amount as total');
  const total_revenue = Number(revenueResult?.total) || 0;

  const [expenseResult] = await db('transactions')
    .where('type', 'expense')
    .where('transaction_date', '>=', yearStart)
    .sum('amount as total');
  const total_expenses = Number(expenseResult?.total) || 0;

  const [taskResult] = await db('tasks')
    .whereIn('status', ['pending', 'in_progress'])
    .count('id as count');
  const active_tasks = Number(taskResult?.count) || 0;

  const [workerResult] = await db('workers')
    .where('is_active', true)
    .count('id as count');
  const worker_count = Number(workerResult?.count) || 0;

  const [stockResult] = await db('inventory_items')
    .whereRaw('quantity < reorder_level')
    .count('id as count');
  const low_stock_items = Number(stockResult?.count) || 0;

  return {
    total_harvest_kg,
    total_revenue,
    total_expenses,
    active_tasks,
    worker_count,
    low_stock_items,
  };
}

export async function getHarvestTrend(): Promise<TrendPoint[]> {
  const monthCol = monthExpr('harvest_date');
  const rows = await db('harvests')
    .select(db.raw(`${monthCol} as month`))
    .sum('quantity_kg as value')
    .where('harvest_date', '>=', dateAgo12Months())
    .groupByRaw(monthCol)
    .orderBy('month', 'asc');

  return rows.map((r: any) => ({ month: r.month, value: Number(r.value) }));
}

export async function getFinanceTrend(): Promise<FinanceTrendPoint[]> {
  const monthCol = monthExpr('transaction_date');
  const rows = await db('transactions')
    .select(db.raw(`${monthCol} as month`))
    .sum(db.raw("CASE WHEN type = 'revenue' THEN amount ELSE 0 END as revenue"))
    .sum(db.raw("CASE WHEN type = 'expense' THEN amount ELSE 0 END as expenses"))
    .where('transaction_date', '>=', dateAgo12Months())
    .groupByRaw(monthCol)
    .orderBy('month', 'asc');

  return rows.map((r: any) => ({
    month: r.month,
    revenue: Number(r.revenue),
    expenses: Number(r.expenses),
  }));
}
