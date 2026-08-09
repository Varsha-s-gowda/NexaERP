import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileBarChart,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import api from '../lib/api';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import { useAuth } from '../context/AuthContext';

import type {
  SalesReportResponse,
  InventoryReportResponse,
  CustomerReportResponse,
  ProductReportResponse,
  TopSellingProductResponse,
} from '../types/reports';

type ReportType = 'sales' | 'inventory' | 'customers' | 'products' | 'top-selling';

interface Customer {
  id: string;
  customerName: string;
  businessName?: string;
  customerCode?: string;
}

interface Warehouse {
  id: string;
  name: string;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string | null) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getMonthLabel = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'PARTIALLY_PAID':
      return 'bg-yellow-100 text-yellow-800';
    case 'PENDING':
    default:
      return 'bg-red-100 text-red-800';
  }
};

export default function Reports() {
  const { user } = useAuth();
  const role = user?.role;

  const defaultReportType = useMemo(() => {
    if (role === 'WAREHOUSE') return 'inventory';
    return 'sales';
  }, [role]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reportType, setReportType] = useState<ReportType>(defaultReportType);
  const [dateRange, setDateRange] = useState('this-month');
  const [warehouseId, setWarehouseId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (role) {
      setReportType(defaultReportType);
    }
  }, [role, defaultReportType]);

  const pageSize = 10;

  /*
   * ---------------------------------------------------------
   * CUSTOMERS
   * ---------------------------------------------------------
   */

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['report-customers'],
    queryFn: async () => {
      const response = await api.get('/customers?page=1&limit=1000');

      const data = response.data?.data;

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.customers)) {
        return data.customers;
      }

      return [];
    },
    enabled: role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS',
  });

  /*
   * ---------------------------------------------------------
   * WAREHOUSES
   * ---------------------------------------------------------
   */

  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ['report-warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');

      const data = response.data?.data;

      return Array.isArray(data) ? data : [];
    },
    enabled: role === 'ADMIN' || role === 'WAREHOUSE',
  });

  /*
   * ---------------------------------------------------------
   * SALES REPORT
   * ---------------------------------------------------------
   */

  const {
    data: salesData = [],
    isLoading: salesLoading,
    isError: salesError,
    refetch: refetchSales,
  } = useQuery<SalesReportResponse[]>({
    queryKey: [
      'reports-sales',
      dateRange,
      customerId,
      status,
      paymentStatusFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (dateRange === 'today') {
        const today = new Date();
        const value = today.toISOString().split('T')[0];

        params.append('startDate', value);
        params.append('endDate', value);
      }

      if (dateRange === 'this-month') {
        const now = new Date();

        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );

        const end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        params.append(
          'startDate',
          start.toISOString().split('T')[0]
        );

        params.append(
          'endDate',
          end.toISOString().split('T')[0]
        );
      }

      if (dateRange === 'last-month') {
        const now = new Date();

        const start = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );

        const end = new Date(
          now.getFullYear(),
          now.getMonth(),
          0
        );

        params.append(
          'startDate',
          start.toISOString().split('T')[0]
        );

        params.append(
          'endDate',
          end.toISOString().split('T')[0]
        );
      }

      if (dateRange === 'all') {
        // No date filters.
      }

      if (customerId) {
        params.append('customerId', customerId);
      }

      if (status) {
        params.append('status', status);
      }

      if (paymentStatusFilter) {
        params.append('paymentStatus', paymentStatusFilter);
      }

      const query = params.toString();

      const response = await api.get(
        `/reports/sales${query ? `?${query}` : ''}`
      );

      return response.data?.data ?? [];
    },
    enabled: reportType === 'sales',
  });

  /*
   * ---------------------------------------------------------
   * INVENTORY REPORT
   * ---------------------------------------------------------
   */

  const {
    data: inventoryData = [],
    isLoading: inventoryLoading,
    isError: inventoryError,
    refetch: refetchInventory,
  } = useQuery<InventoryReportResponse[]>({
    queryKey: ['reports-inventory'],
    queryFn: async () => {
      const response = await api.get('/reports/inventory');

      return response.data?.data ?? [];
    },
    enabled: reportType === 'inventory',
  });

  /*
   * ---------------------------------------------------------
   * CUSTOMER REPORT
   * ---------------------------------------------------------
   */

  const {
    data: customerReportData = [],
    isLoading: customerReportLoading,
    isError: customerReportError,
    refetch: refetchCustomers,
  } = useQuery<CustomerReportResponse[]>({
    queryKey: ['reports-customer-report'],
    queryFn: async () => {
      const response = await api.get('/reports/customers');

      return response.data?.data ?? [];
    },
    enabled: reportType === 'customers',
  });

  /*
   * ---------------------------------------------------------
   * PRODUCT REPORT
   * ---------------------------------------------------------
   */

  const {
    data: productReportData = [],
    isLoading: productReportLoading,
    isError: productReportError,
    refetch: refetchProducts,
  } = useQuery<ProductReportResponse[]>({
    queryKey: ['reports-product-report'],
    queryFn: async () => {
      const response = await api.get('/reports/products');

      return response.data?.data ?? [];
    },
    enabled: reportType === 'products',
  });

  /*
   * ---------------------------------------------------------
   * TOP SELLING
   * ---------------------------------------------------------
   */

  const {
    data: topSellingData = [],
    isLoading: topSellingLoading,
    isError: topSellingError,
    refetch: refetchTopSelling,
  } = useQuery<TopSellingProductResponse[]>({
    queryKey: ['reports-top-selling'],
    queryFn: async () => {
      const response = await api.get('/reports/top-selling?limit=10');

      return response.data?.data ?? [];
    },
    enabled: reportType === 'top-selling',
  });

  /*
   * ---------------------------------------------------------
   * ACTIVE DATA
   * ---------------------------------------------------------
   */

  const activeData = useMemo(() => {
    switch (reportType) {
      case 'sales':
        return salesData;

      case 'inventory':
        return inventoryData;

      case 'customers':
        return customerReportData;

      case 'products':
        return productReportData;

      case 'top-selling':
        return topSellingData;

      default:
        return [];
    }
  }, [
    reportType,
    salesData,
    inventoryData,
    customerReportData,
    productReportData,
    topSellingData,
  ]);

  const isLoading =
    salesLoading ||
    inventoryLoading ||
    customerReportLoading ||
    productReportLoading ||
    topSellingLoading;

  const isError =
    (reportType === 'sales' && salesError) ||
    (reportType === 'inventory' && inventoryError) ||
    (reportType === 'customers' && customerReportError) ||
    (reportType === 'products' && productReportError) ||
    (reportType === 'top-selling' && topSellingError);

  /*
   * ---------------------------------------------------------
   * SALES STATISTICS
   * ---------------------------------------------------------
   */

  const salesStats = useMemo(() => {
    const confirmedSales = salesData.filter((item) => item.status === 'CONFIRMED');
    const totalSales = confirmedSales.length;

    const totalRevenue = confirmedSales.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );

    const productsSold = confirmedSales.reduce(
      (sum, item) => sum + Number(item.totalQuantity || 0),
      0
    );

    const totalCollected = confirmedSales.reduce(
      (sum, item) => sum + Number(item.amountPaid || 0),
      0
    );

    const totalOutstanding = Math.max(0, totalRevenue - totalCollected);

    const pendingPayments = confirmedSales.filter(
      (item) => item.paymentStatus === 'PENDING' || item.paymentStatus === 'PARTIALLY_PAID'
    ).length;

    return {
      totalSales,
      totalRevenue,
      productsSold,
      totalCollected,
      totalOutstanding,
      pendingPayments,
      stockMovements: 0,
    };
  }, [salesData]);

  /*
   * ---------------------------------------------------------
   * SALES CHART DATA
   * ---------------------------------------------------------
   */

  const chartData = useMemo(() => {
    const grouped = new Map<
      string,
      { date: string; revenue: number; sales: number }
    >();

    salesData.forEach((item) => {
      if (item.status !== 'CONFIRMED') return;

      const key = getMonthLabel(item.createdAt);

      const existing = grouped.get(key);

      if (existing) {
        existing.revenue += Number(item.totalAmount || 0);
        existing.sales += 1;
      } else {
        grouped.set(key, {
          date: key,
          revenue: Number(item.totalAmount || 0),
          sales: 1,
        });
      }
    });

    return Array.from(grouped.values()).reverse();
  }, [salesData]);

  /*
   * ---------------------------------------------------------
   * PAGINATION
   * ---------------------------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(activeData.length / pageSize)
  );

  const visibleData = activeData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /*
   * ---------------------------------------------------------
   * RESET
   * ---------------------------------------------------------
   */

  const handleReset = () => {
    setReportType(defaultReportType);
    setDateRange('this-month');
    setWarehouseId('');
    setCustomerId('');
    setStatus('');
    setPaymentStatusFilter('');
    setPage(1);
  };

  /*
   * ---------------------------------------------------------
   * REFRESH
   * ---------------------------------------------------------
   */

  const handleRefresh = () => {
    switch (reportType) {
      case 'sales':
        refetchSales();
        break;

      case 'inventory':
        refetchInventory();
        break;

      case 'customers':
        refetchCustomers();
        break;

      case 'products':
        refetchProducts();
        break;

      case 'top-selling':
        refetchTopSelling();
        break;
    }
  };

  /*
   * ---------------------------------------------------------
   * CSV EXPORT
   * ---------------------------------------------------------
   */

  const exportReport = () => {
    if (!activeData.length) return;

    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'sales') {
      headers = [
        'Challan Number',
        'Customer',
        'Items',
        'Total',
        'Status',
        'Date',
      ];

      rows = salesData.map((item) => [
        item.challanNumber,
        item.customerName,
        String(item.totalQuantity),
        String(item.totalAmount),
        item.status,
        item.createdAt,
      ]);
    }

    if (reportType === 'inventory') {
      headers = [
        'Product Code',
        'Product',
        'Category',
        'Stock',
        'Minimum Stock',
        'Warehouse',
        'Total Value',
      ];

      rows = inventoryData.map((item) => [
        item.productCode,
        item.productName,
        item.category,
        String(item.stockQuantity),
        String(item.minimumStock),
        item.warehouseName,
        String(item.totalValue),
      ]);
    }

    if (reportType === 'customers') {
      headers = [
        'Customer Code',
        'Customer',
        'Business',
        'Status',
        'Challans',
        'Revenue',
        'Last Purchase',
      ];

      rows = customerReportData.map((item) => [
        item.customerCode,
        item.customerName,
        item.businessName,
        item.status,
        String(item.totalChallans),
        String(item.totalRevenue),
        item.lastPurchaseDate ?? '',
      ]);
    }

    if (reportType === 'products') {
      headers = [
        'Product Code',
        'Product',
        'Category',
        'Sales',
        'Quantity Sold',
        'Revenue',
        'Current Stock',
      ];

      rows = productReportData.map((item) => [
        item.productCode,
        item.productName,
        item.category,
        String(item.salesCount),
        String(item.totalQuantitySold),
        String(item.totalRevenue),
        String(item.currentStock),
      ]);
    }

    if (reportType === 'top-selling') {
      headers = [
        'Product Code',
        'Product',
        'Category',
        'Quantity Sold',
        'Revenue',
        'Sales Count',
      ];

      rows = topSellingData.map((item) => [
        item.productCode,
        item.productName,
        item.category,
        String(item.totalQuantitySold),
        String(item.totalRevenue),
        String(item.salesCount),
      ]);
    }

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `${reportType}-report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * ---------------------------------------------------------
   * REPORT TITLE
   * ---------------------------------------------------------
   */

  const reportTitle = {
    sales: 'Sales Report',
    inventory: 'Inventory Report',
    customers: 'Customer Report',
    products: 'Product Report',
    'top-selling': 'Top Selling Products',
  }[reportType];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 text-xs text-slate-500">
                NexaERP&nbsp;&nbsp;›&nbsp;&nbsp; Reports
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                Reports
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View business performance, sales, inventory and
                operational reports.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={exportReport}
                disabled={!activeData.length}
                className="inline-flex items-center gap-2 rounded-md bg-[#0057b8] px-4 py-2 text-sm font-medium text-white hover:bg-[#004b9e] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} />
                Export Report
                <ChevronDown size={15} />
              </button>
            </div>
          </div>

          {/* FILTERS */}

          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Report Type
                </label>

                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(
                      e.target.value as ReportType
                    );
                    setPage(1);
                  }}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  {(role === 'ADMIN' || role === 'SALES' || role === 'ACCOUNTS') && (
                    <option value="sales">Sales Report</option>
                  )}
                  {(role === 'ADMIN' || role === 'WAREHOUSE') && (
                    <option value="inventory">
                      Inventory Report
                    </option>
                  )}
                  {(role === 'ADMIN' || role === 'SALES') && (
                    <option value="customers">
                      Customer Report
                    </option>
                  )}
                  {(role === 'ADMIN' || role === 'WAREHOUSE') && (
                    <option value="products">
                      Product Report
                    </option>
                  )}
                  {(role === 'ADMIN' || role === 'WAREHOUSE') && (
                    <option value="top-selling">
                      Top Selling Products
                    </option>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Date Range
                </label>

                <select
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    setPage(1);
                  }}
                  disabled={reportType !== 'sales'}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                >
                  <option value="this-month">
                    This Month
                  </option>

                  <option value="today">Today</option>

                  <option value="last-month">
                    Last Month
                  </option>

                  <option value="all">All Time</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Warehouse
                </label>

                <select
                  value={warehouseId}
                  onChange={(e) =>
                    setWarehouseId(e.target.value)
                  }
                  disabled={
                    reportType !== 'inventory' &&
                    reportType !== 'products'
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                >
                  <option value="">All Warehouses</option>

                  {warehouses.map((warehouse) => (
                    <option
                      key={warehouse.id}
                      value={warehouse.id}
                    >
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Customer
                </label>

                <select
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(e.target.value)
                  }
                  disabled={reportType !== 'sales'}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                >
                  <option value="">All Customers</option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  disabled={reportType !== 'sales'}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                >
                  <option value="">All Status</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Payment Status
                </label>

                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  disabled={reportType !== 'sales'}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none disabled:bg-slate-50"
                >
                  <option value="">All Payment Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleReset}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>

              <button
                onClick={() => setPage(1)}
                className="rounded-md bg-[#0057b8] px-4 py-2 text-sm font-medium text-white hover:bg-[#004b9e]"
              >
                Apply Filters
              </button>
            </div>
          </section>

          {/* KPI CARDS */}

          {/* KPI CARDS */}

          {reportType === 'sales' ? (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* Total Revenue */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Revenue</span>
                  <div className="rounded-md bg-blue-50 p-2 text-blue-600">
                    <BarChart3 size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(salesStats.totalRevenue)}
                </div>
              </div>

              {/* Collected */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Collected Amount</span>
                  <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(salesStats.totalCollected)}
                </div>
              </div>

              {/* Outstanding */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Outstanding Amount</span>
                  <div className="rounded-md bg-red-50 p-2 text-red-600">
                    <Package size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(salesStats.totalOutstanding)}
                </div>
              </div>

              {/* Pending Payments */}
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Pending Payments</span>
                  <div className="rounded-md bg-orange-50 p-2 text-orange-600">
                    <ShoppingCart size={18} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {salesStats.pendingPayments} invoices
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Total Sales
                  </span>

                  <div className="rounded-md bg-emerald-50 p-2 text-emerald-600">
                    <TrendingUp size={18} />
                  </div>
                </div>

                <div className="text-2xl font-bold text-slate-900">
                  {activeData.length}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Total Revenue
                  </span>

                  <div className="rounded-md bg-blue-50 p-2 text-blue-600">
                    <BarChart3 size={18} />
                  </div>
                </div>

                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    reportType === 'customers'
                      ? customerReportData.reduce(
                          (sum, item) => sum + item.totalRevenue,
                          0
                        )
                      : reportType === 'products'
                      ? productReportData.reduce(
                          (sum, item) => sum + item.totalRevenue,
                          0
                        )
                      : reportType === 'top-selling'
                      ? topSellingData.reduce(
                          (sum, item) => sum + item.totalRevenue,
                          0
                        )
                      : inventoryData.reduce(
                          (sum, item) => sum + item.totalValue,
                          0
                        )
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Products Sold
                  </span>

                  <div className="rounded-md bg-indigo-50 p-2 text-indigo-600">
                    <Package size={18} />
                  </div>
                </div>

                <div className="text-2xl font-bold text-slate-900">
                  {reportType === 'products'
                    ? productReportData.reduce(
                        (sum, item) => sum + item.totalQuantitySold,
                        0
                      )
                    : reportType === 'top-selling'
                    ? topSellingData.reduce(
                        (sum, item) => sum + item.totalQuantitySold,
                        0
                      )
                    : inventoryData.reduce(
                        (sum, item) => sum + item.stockQuantity,
                        0
                      )}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Items Count
                  </span>

                  <div className="rounded-md bg-orange-50 p-2 text-orange-600">
                    <ShoppingCart size={18} />
                  </div>
                </div>

                <div className="text-2xl font-bold text-slate-900">
                  {reportType === 'inventory'
                    ? inventoryData.length
                    : reportType === 'customers'
                    ? customerReportData.length
                    : reportType === 'products'
                    ? productReportData.length
                    : reportType === 'top-selling'
                    ? topSellingData.length
                    : 0}
                </div>
              </div>
            </div>
          )}

          {/* ERROR */}

          {isError && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
              <div>
                <p className="font-semibold text-red-700">
                  Unable to load report data
                </p>

                <p className="text-sm text-red-600">
                  Please check the backend server and try again.
                </p>
              </div>

              <button
                onClick={handleRefresh}
                className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white"
              >
                Retry
              </button>
            </div>
          )}

          {/* SALES CHART */}

          {reportType === 'sales' && (
            <section className="mb-6 rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Sales Report
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Revenue and sales count over time
                    </p>
                  </div>

                  <FileBarChart
                    size={19}
                    className="text-slate-500"
                  />
                </div>
              </div>

              <div className="h-[320px] p-4">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Loading chart...
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No sales data available
                  </div>
                ) : (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <ComposedChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis dataKey="date" />

                      <YAxis
                        yAxisId="left"
                        tickFormatter={(value) =>
                          `₹${Number(value).toLocaleString('en-IN')}`
                        }
                      />

                      <YAxis
                        yAxisId="right"
                        orientation="right"
                      />

                      <Tooltip
                        formatter={(value, name) => [
                          name === 'Revenue'
                            ? formatCurrency(Number(value))
                            : value,
                          name,
                        ]}
                      />

                      <Bar
                        yAxisId="left"
                        dataKey="revenue"
                        name="Revenue"
                        fill="#0057b8"
                        radius={[4, 4, 0, 0]}
                      />

                      <Line
                        yAxisId="right"
                        dataKey="sales"
                        name="Sales Count"
                        stroke="#16a34a"
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          )}

          {/* REPORT TABLE */}

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {reportTitle}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Showing {activeData.length} records
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Users
                  size={17}
                  className="text-slate-400"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                Loading report...
              </div>
            ) : activeData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <FileBarChart
                  size={38}
                  className="mb-3 text-slate-300"
                />

                <p className="font-medium text-slate-700">
                  No report data found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing the selected filters.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      {reportType === 'sales' && (
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Challan No.</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Items</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Paid</th>
                          <th className="px-4 py-3">Outstanding</th>
                          <th className="px-4 py-3">Payment Status</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      )}

                      {reportType === 'inventory' && (
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Current</th>
                          <th className="px-4 py-3">Min</th>
                          <th className="px-4 py-3">Warehouse</th>
                          <th className="px-4 py-3">Value</th>
                        </tr>
                      )}

                      {reportType === 'customers' && (
                        <tr>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Business</th>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Challans</th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">
                            Last Purchase
                          </th>
                        </tr>
                      )}

                      {reportType === 'products' && (
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Sales</th>
                          <th className="px-4 py-3">
                            Quantity Sold
                          </th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">Stock</th>
                        </tr>
                      )}

                      {reportType === 'top-selling' && (
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">
                            Quantity Sold
                          </th>
                          <th className="px-4 py-3">Revenue</th>
                          <th className="px-4 py-3">Sales Count</th>
                        </tr>
                      )}
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {reportType === 'sales' &&
                        (visibleData as SalesReportResponse[]).map(
                          (item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50"
                            >
                              <td className="px-4 py-3 text-slate-600">
                                {formatDate(item.createdAt)}
                              </td>

                              <td className="px-4 py-3 font-medium text-blue-700">
                                {item.challanNumber}
                              </td>

                              <td className="px-4 py-3 text-slate-700">
                                {item.customerName}
                              </td>

                              <td className="px-4 py-3">
                                {item.totalQuantity}
                              </td>

                              <td className="px-4 py-3 font-medium">
                                {formatCurrency(item.totalAmount)}
                              </td>

                              <td className="px-4 py-3 text-green-600 font-medium">
                                {formatCurrency(item.amountPaid || 0)}
                              </td>

                              <td className="px-4 py-3 text-red-600 font-medium">
                                {formatCurrency(item.outstandingAmount ?? (item.totalAmount - (item.amountPaid || 0)))}
                              </td>

                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(item.paymentStatus)}`}>
                                  {item.paymentStatus || 'PENDING'}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <StatusBadge
                                  status={item.status}
                                />
                              </td>
                            </tr>
                          )
                        )}

                      {reportType === 'inventory' &&
                        (
                          visibleData as InventoryReportResponse[]
                        ).map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium">
                              {item.productName}
                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {item.productCode}
                            </td>

                            <td className="px-4 py-3">
                              {item.category}
                            </td>

                            <td className="px-4 py-3 font-semibold">
                              {item.stockQuantity}
                            </td>

                            <td className="px-4 py-3">
                              {item.minimumStock}
                            </td>

                            <td className="px-4 py-3">
                              {item.warehouseName}
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {formatCurrency(item.totalValue)}
                            </td>
                          </tr>
                        ))}

                      {reportType === 'customers' &&
                        (
                          visibleData as CustomerReportResponse[]
                        ).map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium">
                              {item.customerName}
                            </td>

                            <td className="px-4 py-3">
                              {item.businessName}
                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {item.customerCode}
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge
                                status={item.status}
                              />
                            </td>

                            <td className="px-4 py-3">
                              {item.totalChallans}
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {formatCurrency(item.totalRevenue)}
                            </td>

                            <td className="px-4 py-3">
                              {formatDate(item.lastPurchaseDate)}
                            </td>
                          </tr>
                        ))}

                      {reportType === 'products' &&
                        (
                          visibleData as ProductReportResponse[]
                        ).map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium">
                              {item.productName}
                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {item.productCode}
                            </td>

                            <td className="px-4 py-3">
                              {item.category}
                            </td>

                            <td className="px-4 py-3">
                              {item.salesCount}
                            </td>

                            <td className="px-4 py-3">
                              {item.totalQuantitySold}
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {formatCurrency(item.totalRevenue)}
                            </td>

                            <td className="px-4 py-3">
                              {item.currentStock}
                            </td>
                          </tr>
                        ))}

                      {reportType === 'top-selling' &&
                        (
                          visibleData as TopSellingProductResponse[]
                        ).map((item) => (
                          <tr
                            key={item.productId}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 font-medium">
                              {item.productName}
                            </td>

                            <td className="px-4 py-3 text-slate-500">
                              {item.productCode}
                            </td>

                            <td className="px-4 py-3">
                              {item.category}
                            </td>

                            <td className="px-4 py-3 font-semibold">
                              {item.totalQuantitySold}
                            </td>

                            <td className="px-4 py-3 font-medium">
                              {formatCurrency(item.totalRevenue)}
                            </td>

                            <td className="px-4 py-3">
                              {item.salesCount}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}

                <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
                  <span className="text-xs text-slate-500">
                    Showing{' '}
                    {activeData.length === 0
                      ? 0
                      : (page - 1) * pageSize + 1}{' '}
                    to{' '}
                    {Math.min(
                      page * pageSize,
                      activeData.length
                    )}{' '}
                    of {activeData.length} entries
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() =>
                        setPage((current) =>
                          Math.max(1, current - 1)
                        )
                      }
                      className="rounded border border-slate-300 p-1.5 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="px-3 text-sm font-medium text-slate-700">
                      {page} / {totalPages}
                    </span>

                    <button
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages, current + 1)
                        )
                      }
                      className="rounded border border-slate-300 p-1.5 disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/*
 * ---------------------------------------------------------
 * STATUS BADGE
 * ---------------------------------------------------------
 */

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  let className =
    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium';

  if (normalized === 'CONFIRMED' || normalized === 'ACTIVE') {
    className +=
      ' bg-emerald-50 text-emerald-700';
  } else if (
    normalized === 'CANCELLED' ||
    normalized === 'INACTIVE'
  ) {
    className += ' bg-red-50 text-red-700';
  } else if (normalized === 'DRAFT') {
    className += ' bg-orange-50 text-orange-700';
  } else {
    className += ' bg-slate-100 text-slate-600';
  }

  return (
    <span className={className}>
      {normalized}
    </span>
  );
}