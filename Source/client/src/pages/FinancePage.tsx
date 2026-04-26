import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { fetchTransactions, fetchTransactionSummary, createTransaction, updateTransaction, deleteTransaction } from '@/api/finance';
import { fetchWorkers } from '@/api/workers';
import { fetchInventory } from '@/api/inventory';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Transaction, TransactionType, TransactionCategory } from '@shared/types';

const transactionSchema = z.object({
  type: z.enum(['expense', 'revenue']),
  category: z.enum(['labor', 'supplies', 'equipment', 'sales', 'transport', 'other']),
  amount: z.coerce.number().min(0.01, 'Amount must be > 0'),
  description: z.string().min(1, 'Description is required'),
  transaction_date: z.string().min(1, 'Date is required'),
  worker_id: z.string().optional(),
  inventory_item_id: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const typeColors: Record<TransactionType, string> = {
  expense: 'bg-red-100 text-red-800',
  revenue: 'bg-green-100 text-green-800',
};

export default function FinancePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['transactions', page, typeFilter, dateFrom, dateTo],
    queryFn: () => fetchTransactions({ page, limit: 10, type: typeFilter, from: dateFrom || undefined, to: dateTo || undefined }),
  });

  const { data: summary } = useQuery({
    queryKey: ['transaction-summary', dateFrom, dateTo],
    queryFn: () => fetchTransactionSummary({ from: dateFrom || undefined, to: dateTo || undefined }),
  });

  const { data: workersData } = useQuery({ queryKey: ['workers'], queryFn: () => fetchWorkers({}) });
  const { data: inventoryData } = useQuery({ queryKey: ['inventory'], queryFn: () => fetchInventory({}) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }); toast.success(t('finance.created')); closeForm(); },
    onError: () => toast.error(t('finance.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => updateTransaction(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }); toast.success(t('finance.updated')); closeForm(); },
    onError: () => toast.error(t('finance.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }); toast.success(t('finance.deleted')); },
    onError: () => toast.error(t('finance.deleteFailed')),
  });

  function openCreate() {
    setEditingItem(null);
    reset({ type: 'expense', category: 'other', amount: 0, description: '', transaction_date: '', worker_id: '', inventory_item_id: '' });
    setShowForm(true);
  }

  function openEdit(txn: Transaction) {
    setEditingItem(txn);
    reset({
      type: txn.type,
      category: txn.category,
      amount: txn.amount,
      description: txn.description,
      transaction_date: txn.transaction_date?.slice(0, 10) ?? '',
      worker_id: txn.worker_id ?? '',
      inventory_item_id: txn.inventory_item_id ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(formData: TransactionFormData) {
    const payload = {
      ...formData,
      worker_id: formData.worker_id || null,
      inventory_item_id: formData.inventory_item_id || null,
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const typeLabel = (ty: TransactionType): string => ty === 'expense' ? t('finance.expense') : t('finance.revenue');
  const categoryLabel = (c: TransactionCategory): string => {
    const map: Record<TransactionCategory, string> = {
      labor: t('finance.categoryLabor'),
      supplies: t('finance.categorySupplies'),
      equipment: t('finance.categoryEquipment'),
      sales: t('finance.categorySales'),
      transport: t('finance.categoryTransport'),
      other: t('finance.categoryOther'),
    };
    return map[c];
  };

  const columns: Column<Transaction>[] = [
    { header: t('finance.date'), accessor: 'transaction_date', cell: (row) => row.transaction_date ? format(new Date(row.transaction_date), 'dd MMM yyyy') : '-' },
    {
      header: t('finance.type'), accessor: 'type',
      cell: (row) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[row.type]}`}>{typeLabel(row.type)}</span>,
    },
    { header: t('finance.category'), accessor: 'category', cell: (row) => categoryLabel(row.category) },
    {
      header: t('finance.amount'), accessor: 'amount',
      cell: (row) => <span className={row.type === 'revenue' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>Rs {row.amount.toLocaleString()}</span>,
    },
    { header: t('finance.description'), accessor: 'description' },
    {
      header: t('common.actions'), accessor: 'id',
      cell: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="text-blue-600 hover:text-blue-800"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setDeletingId(row.id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t('finance.title')} actionLabel={t('finance.addTransaction')} onAction={openCreate} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">{t('finance.totalRevenue')}</span>
          </div>
          <p className="text-2xl font-bold text-green-700">Rs {summary?.total_revenue?.toLocaleString() ?? 0}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">{t('finance.totalExpenses')}</span>
          </div>
          <p className="text-2xl font-bold text-red-700">Rs {summary?.total_expenses?.toLocaleString() ?? 0}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">{t('finance.netProfit')}</span>
          </div>
          <p className={`text-2xl font-bold ${(summary?.net_profit ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>Rs {summary?.net_profit?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {[
            { value: 'all', label: t('common.all') },
            { value: 'expense', label: t('finance.expense') },
            { value: 'revenue', label: t('finance.revenue') },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setTypeFilter(opt.value); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium ${typeFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{t('common.from')}:</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{t('common.to')}:</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {t('finance.loadFailed')}
        </div>
      )}

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />

      {data && data.total > 10 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">{t('common.page')} {page} {t('common.of')} {Math.ceil(data.total / 10)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">{t('common.previous')}</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= data.total} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">{t('common.next')}</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editingItem ? t('finance.editTransaction') : t('finance.addTransaction')}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.type')}</label>
                  <select {...register('type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="expense">{t('finance.expense')}</option>
                    <option value="revenue">{t('finance.revenue')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.category')}</label>
                  <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="labor">{t('finance.categoryLabor')}</option>
                    <option value="supplies">{t('finance.categorySupplies')}</option>
                    <option value="equipment">{t('finance.categoryEquipment')}</option>
                    <option value="sales">{t('finance.categorySales')}</option>
                    <option value="transport">{t('finance.categoryTransport')}</option>
                    <option value="other">{t('finance.categoryOther')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.amountRs')}</label>
                  <input type="number" step="0.01" {...register('amount')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.date')}</label>
                  <input type="date" {...register('transaction_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.transaction_date && <p className="text-xs text-red-600 mt-1">{errors.transaction_date.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.description')}</label>
                <input {...register('description')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.worker')}</label>
                  <select {...register('worker_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">{t('common.none')}</option>
                    {workersData?.data?.map((w) => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('finance.inventoryItem')}</label>
                  <select {...register('inventory_item_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">{t('common.none')}</option>
                    {inventoryData?.data?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">{t('common.cancel')}</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{createMutation.isPending || updateMutation.isPending ? t('common.saving') : t('common.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title={t('finance.deleteTitle')}
        message={t('finance.deleteConfirm')}
      />
    </div>
  );
}
