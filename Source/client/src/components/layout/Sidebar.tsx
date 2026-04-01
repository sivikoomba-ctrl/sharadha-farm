import { NavLink } from 'react-router-dom';
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
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ClipboardList },
  { to: '/harvests', label: 'Harvests', icon: Cherry },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/finance', label: 'Finance', icon: DollarSign },
  { to: '/workers', label: 'Workers', icon: Users },
  { to: '/zones', label: 'Zones', icon: MapPin },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 text-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
        <Sprout className="h-7 w-7 text-green-400 shrink-0" />
        <span className="text-lg font-semibold leading-tight">
          Sharadha Reddy's Farm
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
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
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
