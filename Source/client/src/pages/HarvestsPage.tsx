import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { fetchHarvests, createHarvest, updateHarvest, deleteHarvest } from '@/api/harvests';
import { fetchZones } from '@/api/zones';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Harvest, HarvestGrade } from '@shared/types';

const harvestSchema = z.object({
  zone_id: z.string().min(1, 'Zone is required'),
  harvest_date: z.string().min(1, 'Harvest date is required'),
  quantity_kg: z.coerce.number().min(0.01, 'Quantity must be > 0'),
  grade: z.enum(['A', 'B', 'C']),
  notes: z.string().optional(),
});

type HarvestFormData = z.infer<typeof harvestSchema>;

const gradeColors: Record<HarvestGrade, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-amber-100 text-amber-800',
};

export default function HarvestsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [zoneFilter, setZoneFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Harvest | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['harvests', page, zoneFilter, dateFrom, dateTo],
    queryFn: () => fetchHarvests({
      page,
      limit: 10,
      zone_id: zoneFilter !== 'all' ? zoneFilter : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    }),
  });

  const { data: zonesData } = useQuery({ queryKey: ['zones'], queryFn: fetchZones });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<HarvestFormData>({
    resolver: zodResolver(harvestSchema),
  });

  const createMutation = useMutation({
    mutationFn: createHarvest,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['harvests'] }); toast.success('Harvest recorded'); closeForm(); },
    onError: () => toast.error('Failed to record harvest'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Harvest> }) => updateHarvest(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['harvests'] }); toast.success('Harvest updated'); closeForm(); },
    onError: () => toast.error('Failed to update harvest'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHarvest,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['harvests'] }); toast.success('Harvest deleted'); },
    onError: () => toast.error('Failed to delete harvest'),
  });

  function openCreate() {
    setEditingItem(null);
    reset({ zone_id: '', harvest_date: '', quantity_kg: 0, grade: 'A', notes: '' });
    setShowForm(true);
  }

  function openEdit(harvest: Harvest) {
    setEditingItem(harvest);
    reset({
      zone_id: harvest.zone_id,
      harvest_date: harvest.harvest_date?.slice(0, 10) ?? '',
      quantity_kg: harvest.quantity_kg,
      grade: harvest.grade,
      notes: harvest.notes ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(formData: HarvestFormData) {
    const payload = { ...formData, notes: formData.notes || null };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const columns: Column<Harvest>[] = [
    { header: 'Date', accessor: 'harvest_date', cell: (row) => row.harvest_date ? format(new Date(row.harvest_date), 'dd MMM yyyy') : '-' },
    { header: 'Zone', accessor: 'zone_name', cell: (row) => row.zone_name ?? '-' },
    { header: 'Quantity (kg)', accessor: 'quantity_kg', cell: (row) => row.quantity_kg.toLocaleString() },
    {
      header: 'Grade', accessor: 'grade',
      cell: (row) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${gradeColors[row.grade]}`}>Grade {row.grade}</span>,
    },
    { header: 'Notes', accessor: 'notes', cell: (row) => row.notes ?? '-' },
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
      <PageHeader title="Harvests" actionLabel="Record Harvest" onAction={openCreate} />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select value={zoneFilter} onChange={(e) => { setZoneFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All Zones</option>
          {zonesData?.data?.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
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
          Failed to load harvests. Please try again later.
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
            <h2 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Harvest' : 'Record Harvest'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                  <select {...register('zone_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">Select zone</option>
                    {zonesData?.data?.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                  {errors.zone_id && <p className="text-xs text-red-600 mt-1">{errors.zone_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harvest Date</label>
                  <input type="date" {...register('harvest_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.harvest_date && <p className="text-xs text-red-600 mt-1">{errors.harvest_date.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                  <input type="number" step="0.01" {...register('quantity_kg')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.quantity_kg && <p className="text-xs text-red-600 mt-1">{errors.quantity_kg.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select {...register('grade')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea {...register('notes')} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
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
        title="Delete Harvest"
        message="Are you sure you want to delete this harvest record? This action cannot be undone."
      />
    </div>
  );
}
