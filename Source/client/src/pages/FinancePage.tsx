import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Pencil, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { fetchTransactions, fetchTransactionSummary, createTransaction, updateTransaction, deleteTransaction } from '@/api/finance';
import { fetchWorkers } from '@/api/workers';
import { fetchInventory } from '@/api/inventory';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Transaction, TransactionType } from '@shared/types';

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }); toast.success('Transaction created'); closeForm(); },
    onError: () => toast.error('Failed to create transaction'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => updateTransaction(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }); toast.success('Transaction updated'); closeForm(); },
    onError: () => toast.error('Failed to update transaction'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transactions'] }); queryClient.invalidateQueries({ queryKey: ['transaction-summary'] }); toast.success('Transaction deleted'); },
    onError: () => toast.error('Failed to delete transaction'),
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

  const columns: Column<Transaction>[] = [
    { header: 'Date', accessor: 'transaction_date', cell: (row) => row.transaction_date ? format(new Date(row.transaction_date), 'dd MMM yyyy') : '-' },
    {
      header: 'Type', accessor: 'type',
      cell: (row) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[row.type]}`}>{row.type}</span>,
    },
    { header: 'Category', accessor: 'category', cell: (row) => <span className="capitalize">{row.category}</span> },
    {
      header: 'Amount', accessor: 'amount',
      cell: (row) => <span className={row.type === 'revenue' ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>Rs {row.amount.toLocaleString()}</span>,
    },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Actions', accessor: 'id',
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
      <PageHeader title="Finance" actionLabel="Add Transaction" onAction={openCreate} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-700">Rs {summary?.total_revenue?.toLocaleString() ?? 0}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-red-700">Rs {summary?.total_expenses?.toLocaleString() ?? 0}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Net Profit</span>
          </div>
          <p className={`text-2xl font-bold ${(summary?.net_profit ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>Rs {summary?.net_profit?.toLocaleString() ?? 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {['all', 'expense', 'revenue'].map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">From:</label>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">To:</label>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          Failed to load transactions. Please try again later.
        </div>
      )}

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />

      {/* Pagination */}
      {data && data.total > 10 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">Page {page} of {Math.ceil(data.total / 10)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Previous</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * 10 >= data.total} className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select {...register('type')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="expense">Expense</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="labor">Labor</option>
                    <option value="supplies">Supplies</option>
                    <option value="equipment">Equipment</option>
                    <option value="sales">Sales</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Rs)</label>
                  <input type="number" step="0.01" {...register('amount')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" {...register('transaction_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.transaction_date && <p className="text-xs text-red-600 mt-1">{errors.transaction_date.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input {...register('description')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Worker (optional)</label>
                  <select {...register('worker_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">None</option>
                    {workersData?.data?.map((w) => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item (optional)</label>
                  <select {...register('inventory_item_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">None</option>
                    {inventoryData?.data?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
      />
    </div>
  );
}
