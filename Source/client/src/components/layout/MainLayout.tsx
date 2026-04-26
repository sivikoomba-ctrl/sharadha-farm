import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageKeys: Record<string, string> = {
  '/': 'dashboard',
  '/tasks': 'tasks',
  '/inventory': 'inventory',
  '/finance': 'finance',
  '/workers': 'workers',
  '/zones': 'zones',
  '/harvests': 'harvests',
  '/profile': 'profile',
};

export default function MainLayout() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const key = pageKeys[pathname];
  const title = key ? t(`nav.${key}`) : 'Page Not Found';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 lg:ml-60 min-w-0">
        <TopBar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
