import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/api/tasks';
import { fetchZones } from '@/api/zones';
import { fetchWorkers } from '@/api/workers';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import type { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import type { Task, TaskStatus, Priority } from '@shared/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  zone_id: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.enum(['pruning', 'fertilizing', 'irrigation', 'harvest', 'pest_control', 'general']),
  due_date: z.string().min(1, 'Due date is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export default function TasksPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tasks', page, statusFilter, priorityFilter],
    queryFn: () => fetchTasks({ page, limit: 10, status: statusFilter, priority: priorityFilter }),
  });

  const { data: zonesData } = useQuery({ queryKey: ['zones'], queryFn: fetchZones });
  const { data: workersData } = useQuery({ queryKey: ['workers'], queryFn: () => fetchWorkers({}) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success(t('tasks.created')); closeForm(); },
    onError: () => toast.error(t('tasks.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success(t('tasks.updated')); closeForm(); },
    onError: () => toast.error(t('tasks.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success(t('tasks.deleted')); },
    onError: () => toast.error(t('tasks.deleteFailed')),
  });

  function openCreate() {
    setEditingItem(null);
    reset({ title: '', description: '', zone_id: '', assigned_to: '', status: 'pending', priority: 'medium', category: 'general', due_date: '' });
    setShowForm(true);
  }

  function openEdit(task: Task) {
    setEditingItem(task);
    reset({
      title: task.title,
      description: task.description ?? '',
      zone_id: task.zone_id ?? '',
      assigned_to: task.assigned_to ?? '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      due_date: task.due_date?.slice(0, 10) ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(formData: TaskFormData) {
    const payload = {
      ...formData,
      zone_id: formData.zone_id || null,
      assigned_to: formData.assigned_to || null,
      description: formData.description || null,
    };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const statusLabel = (s: TaskStatus): string => {
    const map: Record<TaskStatus, string> = {
      pending: t('tasks.statusPending'),
      in_progress: t('tasks.statusInProgress'),
      completed: t('tasks.statusCompleted'),
      cancelled: t('tasks.statusCancelled'),
    };
    return map[s];
  };

  const priorityLabel = (p: Priority): string => {
    const map: Record<Priority, string> = {
      low: t('tasks.priorityLow'),
      medium: t('tasks.priorityMedium'),
      high: t('tasks.priorityHigh'),
    };
    return map[p];
  };

  const columns: Column<Task>[] = [
    { header: t('tasks.taskTitle'), accessor: 'title' },
    { header: t('tasks.zone'), accessor: 'zone_name', cell: (row) => row.zone_name ?? '-' },
    { header: t('tasks.assignedTo'), accessor: 'worker_name', cell: (row) => row.worker_name ?? '-' },
    {
      header: t('tasks.status'), accessor: 'status',
      cell: (row) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[row.status]}`}>{statusLabel(row.status)}</span>,
    },
    {
      header: t('tasks.priority'), accessor: 'priority',
      cell: (row) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[row.priority]}`}>{priorityLabel(row.priority)}</span>,
    },
    { header: t('tasks.dueDate'), accessor: 'due_date', cell: (row) => row.due_date ? format(new Date(row.due_date), 'dd MMM yyyy') : '-' },
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
      <PageHeader title={t('tasks.title')} actionLabel={t('tasks.addTask')} onAction={openCreate} />

      <div className="flex gap-4 mb-4 flex-wrap">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">{t('tasks.allStatus')}</option>
          <option value="pending">{t('tasks.statusPending')}</option>
          <option value="in_progress">{t('tasks.statusInProgress')}</option>
          <option value="completed">{t('tasks.statusCompleted')}</option>
          <option value="cancelled">{t('tasks.statusCancelled')}</option>
        </select>
        <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="all">{t('tasks.allPriority')}</option>
          <option value="low">{t('tasks.priorityLow')}</option>
          <option value="medium">{t('tasks.priorityMedium')}</option>
          <option value="high">{t('tasks.priorityHigh')}</option>
        </select>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {t('tasks.loadFailed')}
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
            <h2 className="text-lg font-semibold mb-4">{editingItem ? t('tasks.editTask') : t('tasks.addTask')}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.taskTitle')}</label>
                <input {...register('title')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.description')}</label>
                <textarea {...register('description')} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.zone')}</label>
                  <select {...register('zone_id')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">{t('common.none')}</option>
                    {zonesData?.data?.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.assignedTo')}</label>
                  <select {...register('assigned_to')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">{t('tasks.unassigned')}</option>
                    {workersData?.data?.map((w) => <option key={w.id} value={w.id}>{w.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.status')}</label>
                  <select {...register('status')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="pending">{t('tasks.statusPending')}</option>
                    <option value="in_progress">{t('tasks.statusInProgress')}</option>
                    <option value="completed">{t('tasks.statusCompleted')}</option>
                    <option value="cancelled">{t('tasks.statusCancelled')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.priority')}</label>
                  <select {...register('priority')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="low">{t('tasks.priorityLow')}</option>
                    <option value="medium">{t('tasks.priorityMedium')}</option>
                    <option value="high">{t('tasks.priorityHigh')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.category')}</label>
                  <select {...register('category')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="general">{t('tasks.categoryGeneral')}</option>
                    <option value="pruning">{t('tasks.categoryPruning')}</option>
                    <option value="fertilizing">{t('tasks.categoryFertilizing')}</option>
                    <option value="irrigation">{t('tasks.categoryIrrigation')}</option>
                    <option value="harvest">{t('tasks.categoryHarvest')}</option>
                    <option value="pest_control">{t('tasks.categoryPestControl')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('tasks.dueDate')}</label>
                <input type="date" {...register('due_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.due_date && <p className="text-xs text-red-600 mt-1">{errors.due_date.message}</p>}
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
        title={t('tasks.deleteTitle')}
        message={t('tasks.deleteConfirm')}
      />
    </div>
  );
}
