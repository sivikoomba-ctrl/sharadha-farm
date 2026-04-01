import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchHarvestTrend, fetchFinanceTrend } from '@/api/dashboard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { TrendingUp, DollarSign, CreditCard, ClipboardList } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
  });

  const { data: harvestTrend, isLoading: loadingHarvest } = useQuery({
    queryKey: ['harvest-trend'],
    queryFn: fetchHarvestTrend,
  });

  const { data: financeTrend, isLoading: loadingFinance } = useQuery({
    queryKey: ['finance-trend'],
    queryFn: fetchFinanceTrend,
  });

  if (loadingSummary) return <LoadingSpinner />;

  const kpis = [
    {
      label: 'Total Harvest',
      value: `${summary?.total_harvest_kg?.toLocaleString() ?? 0} kg`,
      icon: TrendingUp,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      text: 'text-blue-700',
    },
    {
      label: 'Revenue',
      value: `Rs ${summary?.total_revenue?.toLocaleString() ?? 0}`,
      icon: DollarSign,
      bg: 'bg-green-50',
      iconBg: 'bg-green-500',
      text: 'text-green-700',
    },
    {
      label: 'Expenses',
      value: `Rs ${summary?.total_expenses?.toLocaleString() ?? 0}`,
      icon: CreditCard,
      bg: 'bg-red-50',
      iconBg: 'bg-red-500',
      text: 'text-red-700',
    },
    {
      label: 'Active Tasks',
      value: String(summary?.active_tasks ?? 0),
      icon: ClipboardList,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-500',
      text: 'text-amber-700',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-xl ${kpi.bg} p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`rounded-lg ${kpi.iconBg} p-2`}>
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-bold ${kpi.text}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Harvest Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Harvest Trend</h2>
          {loadingHarvest ? (
            <LoadingSpinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={harvestTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Harvest (kg)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Finance Trend */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Finance Trend</h2>
          {loadingFinance ? (
            <LoadingSpinner />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financeTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
