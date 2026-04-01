import { format } from 'date-fns';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </span>
        {user && (
          <div className="flex items-center gap-3 border-l pl-4">
            <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">{user.full_name}</Link>
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
