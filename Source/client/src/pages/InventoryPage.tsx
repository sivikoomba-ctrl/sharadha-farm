import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { fetchInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/api/inventory';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { InventoryItem, InventoryCategory } from '@shared/types';

const inventorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['fertilizer', 'pesticide', 'tool', 'packaging', 'seed', 'other']),
  quantity: z.coerce.number().min(0, 'Must be >= 0'),
  unit: z.string().min(1, 'Unit is required'),
  reorder_level: z.coerce.number().min(0),
  unit_cost: z.coerce.number().min(0),
  location: z.string().min(1, 'Location is required'),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

const unitOptions = ['kg', 'liters', 'pieces', 'bags', 'bottles', 'boxes'];

export default function InventoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['inventory', page, categoryFilter],
    queryFn: () => fetchInventory({ page, limit: 10, category: categoryFilter }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
  });

  const createMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success(t('inventory.created')); closeForm(); },
    onError: () => toast.error(t('inventory.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) => updateInventoryItem(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success(t('inventory.updated')); closeForm(); },
    onError: () => toast.error(t('inventory.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }); toast.success(t('inventory.deleted')); },
    onError: () => toast.error(t('inventory.deleteFailed')),
  });

  const lowStockItems = data?.data?.filter((item) => item.quantity < item.reorder_level) ?? [];

  function openCreate() {
    setEditingItem(null);
    reset({ name: '', category: 'other', quantity: 0, unit: 'kg', reorder_level: 0, unit_cost: 0, location: '' });
    setShowForm(true);
  }

  function openEdit(item: InventoryItem) {
    setEditingItem(item);
    reset({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      reorder_level: item.reorder_level,
      unit_cost: item.unit_cost,
      location: item.location,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(formData: InventoryFormData) {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  const categoryLabel = (c: InventoryCategory): string => {
    const map: Record<InventoryCategory, string> = {
      fertilizer: t('inventory.categoryFertilizer'),
      pesticide: t('inventory.categoryPesticide'),
      tool: t('inventory.categoryTool'),
      packaging: t('inventory.categoryPackaging'),
      seed: t('inventory.categorySeed'),
      other: t('inventory.categoryOther'),
    };
    return map[c];
  };

  const columns: Column<InventoryItem>[] = [
    { header: t('inventory.name'), accessor: 'name' },
    { header: t('inventory.category'), accessor: 'category', cell: (row) => categoryLabel(row.category) },
    { header: t('inventory.quantity'), accessor: 'quantity', cell: (row) => `${row.quantity} ${row.unit}` },
    { header: t('inventory.reorderLevel'), accessor: 'reorder_level' },
    { header: t('inventory.unitCost'), accessor: 'unit_cost', cell: (row) => `Rs ${row.unit_cost.toLocaleString()}` },
    { header: t('inventory.location'), accessor: 'location' },
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
      <PageHeader title={t('inventory.title')} actionLabel={t('inventory.addItem')} onAction={openCreate} />

      {lowStockItems.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            {t('inventory.lowStockAlert', { count: lowStockItems.length, names: lowStockItems.map((i) => i.name).join(', ') })}
          </p>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">{t('inventory.allCategories')}</option>
          <option value="fertilizer">{t('inventory.categoryFertilizer')}</option>
          <option value="pesticide">{t('inventory.categoryPesticide')}</option>
          <option value="tool">{t('inventory.categoryTool')}</option>
          <option value="packaging">{t('inventory.categoryPackaging')}</option>
          <option value="seed">{t('inventory.categorySeed')}</option>
          <option value="other">{t('inventory.categoryOther')}</option>
        </select>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {t('inventory.loadFailed')}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        loading={isLoading}
        rowClassName={(row) => (row.quantity < row.reorder_level ? 'bg-red-50' : '')}
      />

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
            <h2 className="text-lg font-semibold mb-4">{editingItem ? t('inventory.editItem') : t('inventory.addItem')}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.name')}</label>
                <input {...register('name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.category')}</label>
                  <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="fertilizer">{t('inventory.categoryFertilizer')}</option>
                    <option value="pesticide">{t('inventory.categoryPesticide')}</option>
                    <option value="tool">{t('inventory.categoryTool')}</option>
                    <option value="packaging">{t('inventory.categoryPackaging')}</option>
                    <option value="seed">{t('inventory.categorySeed')}</option>
                    <option value="other">{t('inventory.categoryOther')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.unit')}</label>
                  <select {...register('unit')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.quantity')}</label>
                  <input type="number" step="any" {...register('quantity')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.reorderLevel')}</label>
                  <input type="number" step="any" {...register('reorder_level')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.unitCostRs')}</label>
                  <input type="number" step="any" {...register('unit_cost')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('inventory.location')}</label>
                <input {...register('location')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location.message}</p>}
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
        title={t('inventory.deleteTitle')}
        message={t('inventory.deleteConfirm')}
      />
    </div>
  );
}
