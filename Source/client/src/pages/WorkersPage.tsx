import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { fetchWorkers, createWorker, updateWorker, deleteWorker } from '@/api/workers';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Worker, WorkerRole } from '@shared/types';

const workerSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  role: z.enum(['supervisor', 'field_worker', 'seasonal']),
  daily_wage: z.coerce.number().min(0, 'Wage must be >= 0'),
  is_active: z.boolean(),
  joined_date: z.string().min(1, 'Joined date is required'),
});

type WorkerFormData = z.infer<typeof workerSchema>;

const roleColors: Record<WorkerRole, string> = {
  supervisor: 'bg-purple-100 text-purple-800',
  field_worker: 'bg-blue-100 text-blue-800',
  seasonal: 'bg-amber-100 text-amber-800',
};

export default function WorkersPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Worker | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workers', roleFilter, activeFilter],
    queryFn: () => fetchWorkers({ role: roleFilter, is_active: activeFilter }),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkerFormData>({
    resolver: zodResolver(workerSchema),
  });

  const createMutation = useMutation({
    mutationFn: createWorker,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workers'] }); toast.success('Worker added'); closeForm(); },
    onError: () => toast.error('Failed to add worker'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Worker> }) => updateWorker(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workers'] }); toast.success('Worker updated'); closeForm(); },
    onError: () => toast.error('Failed to update worker'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorker,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workers'] }); toast.success('Worker deleted'); },
    onError: () => toast.error('Failed to delete worker'),
  });

  function openCreate() {
    setEditingItem(null);
    reset({ full_name: '', phone: '', role: 'field_worker', daily_wage: 0, is_active: true, joined_date: '' });
    setShowForm(true);
  }

  function openEdit(worker: Worker) {
    setEditingItem(worker);
    reset({
      full_name: worker.full_name,
      phone: worker.phone,
      role: worker.role,
      daily_wage: worker.daily_wage,
      is_active: worker.is_active,
      joined_date: worker.joined_date?.slice(0, 10) ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(formData: WorkerFormData) {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  const columns: Column<Worker>[] = [
    { header: 'Name', accessor: 'full_name' },
    {
      header: 'Role', accessor: 'role',
      cell: (row) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[row.role]}`}>{row.role.replace('_', ' ')}</span>,
    },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Daily Wage', accessor: 'daily_wage', cell: (row) => `Rs ${row.daily_wage.toLocaleString()}` },
    {
      header: 'Status', accessor: 'is_active',
      cell: (row) => (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${row.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { header: 'Joined Date', accessor: 'joined_date', cell: (row) => row.joined_date ? format(new Date(row.joined_date), 'dd MMM yyyy') : '-' },
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
      <PageHeader title="Workers" actionLabel="Add Worker" onAction={openCreate} />

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">All Roles</option>
          <option value="supervisor">Supervisor</option>
          <option value="field_worker">Field Worker</option>
          <option value="seasonal">Seasonal</option>
        </select>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {[
            { label: 'All', value: undefined },
            { label: 'Active', value: true },
            { label: 'Inactive', value: false },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-4 py-2 text-sm font-medium ${activeFilter === opt.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          Failed to load workers. Please try again later.
        </div>
      )}

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Worker' : 'Add Worker'}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input {...register('full_name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input {...register('phone')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select {...register('role')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="supervisor">Supervisor</option>
                    <option value="field_worker">Field Worker</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Wage (Rs)</label>
                  <input type="number" step="0.01" {...register('daily_wage')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.daily_wage && <p className="text-xs text-red-600 mt-1">{errors.daily_wage.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                  <input type="date" {...register('joined_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.joined_date && <p className="text-xs text-red-600 mt-1">{errors.joined_date.message}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('is_active')} id="is_active" className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
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
        title="Delete Worker"
        message="Are you sure you want to delete this worker? This action cannot be undone."
      />
    </div>
  );
}
