import { format } from 'date-fns';
import { LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100 text-gray-600"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden xl:inline text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </span>
        <LanguageSwitcher />
        {user && (
          <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:pl-4">
            <Link to="/profile" className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors truncate max-w-[160px]">{user.full_name}</Link>
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title={t('common.signOut')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
