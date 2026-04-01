import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/inventory': 'Inventory',
  '/finance': 'Finance',
  '/workers': 'Workers',
  '/zones': 'Zones',
  '/harvests': 'Harvests',
  '/profile': 'My Profile',
};

export default function MainLayout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'Page Not Found';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-60">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
