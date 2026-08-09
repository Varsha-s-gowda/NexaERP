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
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = user?.role;

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
    enabled: role === 'ADMIN' || role === 'WAREHOUSE',
  });

  // Fetch monthly sales
  const { data: monthlySales, isLoading: salesLoading, error: salesError, refetch: refetchSales } = useQuery({
    queryKey: ['monthly-sales'],
    queryFn: async () => {
      const response = await api.get<{ data: SalesSummary[] }>('/dashboard/monthly-sales');
      return response.data.data;
    },
    enabled: role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS',
  });

  // Fetch recent sales
  const { data: recentSales, isLoading: recentSalesLoading, error: recentSalesError, refetch: refetchRecentSales } = useQuery({
    queryKey: ['recent-sales'],
    queryFn: async () => {
      const response = await api.get<{ data: SalesReport[] }>('/reports/sales');
      return response.data.data;
    },
    enabled: role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS',
  });

  const defaultSummary: DashboardSummary = {
    totalCustomers: 0,
    activeCustomers: 0,
    leadCustomers: 0,
    inactiveCustomers: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outofStockProducts: 0,
    totalWarehouses: 0,
    activeWarehouses: 0,
    totalStockMovements: 0,
    stockInMovements: 0,
    stockOutMovements: 0,
    transferMovements: 0,
    totalSales: 0,
    draftSales: 0,
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

      <div className="flex-1 flex flex-col">
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

          {/* Financial Overview (ADMIN and ACCOUNTS only) */}
          {(role === 'ADMIN' || role === 'ACCOUNTS') && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Financial Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Total Revenue</p>
                  <p className="text-xl font-bold text-gray-900">₹{(currentSummary.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Collected Amount</p>
                  <p className="text-xl font-bold text-green-600">₹{(currentSummary.totalCollected || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Outstanding Amount</p>
                  <p className="text-xl font-bold text-red-600">₹{(currentSummary.totalOutstanding || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Pending Payments</p>
                  <p className="text-xl font-bold text-amber-600">{currentSummary.pendingPaymentsCount || 0} invoices</p>
                </div>
              </div>
            </div>
          )}

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
