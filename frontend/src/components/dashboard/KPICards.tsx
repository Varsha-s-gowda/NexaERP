import { Users, Package, Warehouse, FileText, DollarSign } from 'lucide-react';
import type { DashboardSummary } from '../../types/dashboard';

interface KPICardsProps {
  summary: DashboardSummary;
  isLoading: boolean;
}

export default function KPICards({ summary, isLoading }: KPICardsProps) {
  const kpis = [
    {
      label: 'TOTAL CUSTOMERS',
      value: summary.totalCustomers,
      supporting: `${summary.activeCustomers} active`,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'TOTAL PRODUCTS',
      value: summary.totalProducts,
      supporting: `${summary.lowStockProducts} low stock`,
      icon: Package,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      label: 'TOTAL WAREHOUSES',
      value: summary.totalWarehouses,
      supporting: 'Active locations',
      icon: Warehouse,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'TOTAL SALES',
      value: summary.totalSales,
      supporting: `${summary.confirmedSales} confirmed`,
      icon: FileText,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'TOTAL REVENUE',
      value: `₹${summary.totalRevenue.toLocaleString()}`,
      supporting: `Today: ₹${summary.todayRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-teal-500',
      bgColor: 'bg-teal-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 ${kpi.bgColor} rounded-lg`}>
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
          <p className="text-xs text-gray-500">{kpi.supporting}</p>
        </div>
      ))}
    </div>
  );
}
