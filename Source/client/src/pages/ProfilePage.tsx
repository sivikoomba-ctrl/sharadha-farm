import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { User, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { updateProfile } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, setAuth } = useAuth();
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || '' },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileUpdate = async (data: ProfileFormData) => {
    setProfileSubmitting(true);
    try {
      const res = await updateProfile({ full_name: data.full_name });
      setAuth(res.data.token, res.data.user);
      toast.success(t('profile.profileUpdated'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('profile.updateFailed'));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormData) => {
    setPasswordSubmitting(true);
    try {
      const res = await updateProfile({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setAuth(res.data.token, res.data.user);
      passwordForm.reset();
      toast.success(t('profile.passwordChanged'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('profile.passwordChangeFailed'));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile Info */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile.info')}</h2>
            <p className="text-sm text-gray-500">{t('profile.infoSubtitle')}</p>
          </div>
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.username')}</label>
            <input
              value={user?.username || ''}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.role')}</label>
            <input
              value={user?.role || ''}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 capitalize"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.fullName')}</label>
            <input
              {...profileForm.register('full_name')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            {profileForm.formState.errors.full_name && (
              <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.full_name.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={profileSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {profileSubmitting ? t('common.saving') : t('common.saveChanges')}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Lock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('profile.changePassword')}</h2>
            <p className="text-sm text-gray-500">{t('profile.changePasswordSubtitle')}</p>
          </div>
        </div>

        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.currentPassword')}</label>
            <input
              type="password"
              {...passwordForm.register('current_password')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            {passwordForm.formState.errors.current_password && (
              <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.current_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.newPassword')}</label>
            <input
              type="password"
              {...passwordForm.register('new_password')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            {passwordForm.formState.errors.new_password && (
              <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.new_password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.confirmPassword')}</label>
            <input
              type="password"
              {...passwordForm.register('confirm_password')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            {passwordForm.formState.errors.confirm_password && (
              <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors.confirm_password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={passwordSubmitting}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {passwordSubmitting ? t('profile.changing') : t('profile.changePasswordBtn')}
          </button>
        </form>
      </div>
    </div>
  );
}
