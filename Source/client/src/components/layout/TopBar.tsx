import { format } from 'date-fns';

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <span className="text-sm text-gray-500">
        {format(new Date(), 'EEEE, MMMM d, yyyy')}
      </span>
    </header>
  );
}
