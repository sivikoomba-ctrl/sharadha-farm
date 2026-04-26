import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Pencil, Trash2, Plus, MapPin } from 'lucide-react';
import { fetchZones, createZone, updateZone, deleteZone } from '@/api/zones';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import EmptyState from '@/components/shared/EmptyState';
import type { Zone, ZoneStatus } from '@shared/types';

const zoneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  area_hectares: z.coerce.number().min(0.01, 'Area must be > 0'),
  variety: z.string().min(1, 'Variety is required'),
  planting_date: z.string().min(1, 'Planting date is required'),
  status: z.enum(['active', 'dormant', 'replanting']),
  notes: z.string().optional(),
});

type ZoneFormData = z.infer<typeof zoneSchema>;

const statusColors: Record<ZoneStatus, string> = {
  active: 'bg-green-100 text-green-800',
  dormant: 'bg-gray-100 text-gray-800',
  replanting: 'bg-amber-100 text-amber-800',
};

const blueberryVarieties = [
  'Bluecrop', 'Duke', 'Elliott', 'Jersey', 'Legacy',
  'Northland', 'Patriot', 'Spartan', 'Sunshine Blue', 'Top Hat',
];

export default function ZonesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Zone | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({ queryKey: ['zones'], queryFn: fetchZones });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
  });

  const createMutation = useMutation({
    mutationFn: createZone,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['zones'] }); toast.success(t('zones.created')); closeForm(); },
    onError: () => toast.error(t('zones.createFailed')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Zone> }) => updateZone(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['zones'] }); toast.success(t('zones.updated')); closeForm(); },
    onError: () => toast.error(t('zones.updateFailed')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteZone,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['zones'] }); toast.success(t('zones.deleted')); },
    onError: () => toast.error(t('zones.deleteFailed')),
  });

  function openCreate() {
    setEditingItem(null);
    reset({ name: '', area_hectares: 0, variety: '', planting_date: '', status: 'active', notes: '' });
    setShowForm(true);
  }

  function openEdit(zone: Zone) {
    setEditingItem(zone);
    reset({
      name: zone.name,
      area_hectares: zone.area_hectares,
      variety: zone.variety,
      planting_date: zone.planting_date?.slice(0, 10) ?? '',
      status: zone.status,
      notes: zone.notes ?? '',
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingItem(null);
  }

  function onSubmit(formData: ZoneFormData) {
    const payload = { ...formData, notes: formData.notes || null };
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const statusLabel = (status: ZoneStatus): string => t(`zones.status${status.charAt(0).toUpperCase() + status.slice(1)}`);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('zones.title')}</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t('zones.addZone')}
        </button>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {t('zones.loadFailed')}
        </div>
      )}
      {!isLoading && !isError && (!data?.data || data.data.length === 0) && <EmptyState message={t('zones.noZones')} />}

      {!isLoading && data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
                </div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[zone.status]}`}>
                  {statusLabel(zone.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">{t('zones.variety')}:</span> {zone.variety}</p>
                <p><span className="font-medium">{t('zones.areaShort')}:</span> {zone.area_hectares} ha</p>
                <p><span className="font-medium">{t('zones.planted')}:</span> {zone.planting_date ? format(new Date(zone.planting_date), 'dd MMM yyyy') : '-'}</p>
                {zone.notes && (
                  <p className="text-gray-500 line-clamp-2"><span className="font-medium">{t('zones.notes')}:</span> {zone.notes}</p>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(zone)} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                  <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                </button>
                <button onClick={() => setDeletingId(zone.id)} className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800">
                  <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={closeForm} />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{editingItem ? t('zones.editZone') : t('zones.addZone')}</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.name')}</label>
                <input {...register('name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.area')}</label>
                  <input type="number" step="0.01" {...register('area_hectares')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.area_hectares && <p className="text-xs text-red-600 mt-1">{errors.area_hectares.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.variety')}</label>
                  <select {...register('variety')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="">{t('zones.selectVariety')}</option>
                    {blueberryVarieties.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {errors.variety && <p className="text-xs text-red-600 mt-1">{errors.variety.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.plantingDate')}</label>
                  <input type="date" {...register('planting_date')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  {errors.planting_date && <p className="text-xs text-red-600 mt-1">{errors.planting_date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.status')}</label>
                  <select {...register('status')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    <option value="active">{t('zones.statusActive')}</option>
                    <option value="dormant">{t('zones.statusDormant')}</option>
                    <option value="replanting">{t('zones.statusReplanting')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('zones.notes')}</label>
                <textarea {...register('notes')} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
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
        title={t('zones.deleteTitle')}
        message={t('zones.deleteConfirm')}
      />
    </div>
  );
}
