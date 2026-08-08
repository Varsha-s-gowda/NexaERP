import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { DashboardSummary, LowStockProduct, SalesSummary, SalesReport } from '../types/dashboard';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import KPICards from '../components/dashboard/KPICards';
import LowStockTable from '../components/dashboard/LowStockTable';
import SalesChart from '../components/dashboard/SalesChart';
import RecentSales from '../components/dashboard/RecentSales';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const response = await api.get<{ data: DashboardSummary }>('/dashboard/summary');
      return response.data.data;
    },
  });

  // Fetch low stock products
  const { data: lowStock, isLoading: lowStockLoading, error: lowStockError, refetch: refetchLowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const response = await api.get<{ data: LowStockProduct[] }>('/dashboard/low-stock');
      return response.data.data;
    },
  });

  // Fetch monthly sales
  const { data: monthlySales, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useQuery({
    queryKey: ['monthly-sales'],
    queryFn: async () => {
      const response = await api.get<{ data: SalesSummary[] }>('/dashboard/monthly-sales');
      return response.data.data;
    },
  });

  // Fetch recent sales
  const { data: recentSales, isLoading: recentSalesLoading, error: recentSalesError, refetch: refetchRecentSales } = useQuery({
    queryKey: ['recent-sales'],
    queryFn: async () => {
      const response = await api.get<{ data: SalesReport[] }>('/reports/sales');
      return response.data.data;
    },
  });

  const defaultSummary: DashboardSummary = {
    totalCustomers: 0,
    activeCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalWarehouses: 0,
    totalSales: 0,
    confirmedSales: 0,
    cancelledSales: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  };

  const currentSummary = summary || defaultSummary;
  const currentLowStock = lowStock || [];
  const currentSales = monthlySales || [];
  const currentRecentSales = recentSales || [];

  const hasError = summaryError || lowStockError || salesError || recentSalesError;

  const handleRetry = () => {
    refetchSummary();
    refetchLowStock();
    refetchSales();
    refetchRecentSales();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {hasError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Unable to load dashboard data</p>
              <p className="text-sm mb-2">Please try again.</p>
              <button
                onClick={handleRetry}
                className="text-sm font-medium underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="mb-6">
            <KPICards summary={currentSummary} isLoading={summaryLoading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2">
              <SalesChart data={currentSales} isLoading={salesLoading} />
            </div>

            {/* Low Stock Products */}
            <div>
              <LowStockTable products={currentLowStock.slice(0, 5)} isLoading={lowStockLoading} />
            </div>
          </div>

          {/* Recent Sales */}
          <div>
            <RecentSales sales={currentRecentSales} isLoading={recentSalesLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
