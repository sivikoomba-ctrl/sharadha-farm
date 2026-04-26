import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sprout,
  LayoutDashboard,
  ClipboardList,
  Package,
  DollarSign,
  Users,
  MapPin,
  Cherry,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/', key: 'dashboard', icon: LayoutDashboard },
  { to: '/tasks', key: 'tasks', icon: ClipboardList },
  { to: '/harvests', key: 'harvests', icon: Cherry },
  { to: '/inventory', key: 'inventory', icon: Package },
  { to: '/finance', key: 'finance', icon: DollarSign },
  { to: '/workers', key: 'workers', icon: Users },
  { to: '/zones', key: 'zones', icon: MapPin },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-60 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-green-400 shrink-0" />
            <span className="text-lg font-semibold leading-tight">
              {t('login.title')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden rounded-lg p-1 hover:bg-slate-700"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {t(`nav.${key}`)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
