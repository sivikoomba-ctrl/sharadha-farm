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

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 text-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
        <Sprout className="h-7 w-7 text-green-400 shrink-0" />
        <span className="text-lg font-semibold leading-tight">
          {t('login.title')}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
  );
}
