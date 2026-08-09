import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Plus,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  MoreVertical,
} from 'lucide-react';

// ─── Types (matching backend interfaces exactly) ───────────────────────────

interface SalesChallanItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  sellingPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  createdBy: string;
  items: SalesChallanItem[];
  createdAt: string;
  updatedAt: string;
  customerName: string;
  businessName: string;
}

interface SalesChallansResponse {
  challans: SalesChallan[];
  total: number;
}

interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  businessName: string;
  status: string;
}

interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  sellingPrice: number;
  gstPercentage: number;
  stockQuantity: number;
  status: string;
}

interface ChallanStats {
  totalSales: number;
  draftSales: number;
  confirmedSales: number;
  cancelledSales: number;
  totalRevenue: number;
}

// ─── Form line item for create modal ──────────────────────────────────────

interface LineItem {
  productId: string;
  quantity: number;
}

// ─── Zod schema ───────────────────────────────────────────────────────────

const createChallanSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Please select a product'),
        quantity: z
          .number()
          .int()
          .min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one item is required'),
});

type CreateChallanFormData = z.infer<typeof createChallanSchema>;

// ─── Helper functions ──────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getChallanStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getChallanStatusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle className="h-3 w-3" />;
    case 'DRAFT':
      return <Clock className="h-3 w-3" />;
    case 'CANCELLED':
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

// ─── Component ─────────────────────────────────────────────────────────────

export default function SalesChallans() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [newStatus, setNewStatus] = useState<'CONFIRMED' | 'CANCELLED'>('CONFIRMED');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Line items state for create form
  const [lineItems, setLineItems] = useState<LineItem[]>([{ productId: '', quantity: 1 }]);

  const isAdmin = user?.role === 'ADMIN';

  // ─── Queries ──────────────────────────────────────────────────────────

  const {
    data: challansData,
    isLoading: challansLoading,
    refetch,
    error: challansError,
  } = useQuery({
    queryKey: ['sales-challans', page, search, statusFilter, customerFilter, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (customerFilter) params.append('customerId', customerFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get<{ data: SalesChallansResponse }>(
        `/sales-challans?${params.toString()}`
      );
      return response.data.data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['challan-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      const d = response.data.data;
      return {
        totalSales: d.totalSales || 0,
        draftSales: d.draftSales || 0,
        confirmedSales: d.confirmedSales || 0,
        cancelledSales: d.cancelledSales || 0,
        totalRevenue: d.totalRevenue || 0,
      } as ChallanStats;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers-dropdown'],
    queryFn: async () => {
      const response = await api.get('/customers?limit=1000');
      return (response.data.data.customers || []) as Customer[];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products-dropdown'],
    queryFn: async () => {
      const response = await api.get('/products?limit=1000&status=ACTIVE');
      return (response.data.data.products || []) as Product[];
    },
  });

  const challans = challansData?.challans || [];
  const total = challansData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // ─── Mutations ────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async (data: CreateChallanFormData) => {
      await api.post('/sales-challans', data);
    },
    onSuccess: () => {
      toast.success('Sales challan created successfully');
      setShowCreateModal(false);
      resetCreate();
      setLineItems([{ productId: '', quantity: 1 }]);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['challan-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create sales challan');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/sales-challans/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Challan status updated successfully');
      setShowStatusModal(false);
      setSelectedChallan(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['challan-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // ─── Form ─────────────────────────────────────────────────────────────

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
    setValue: setCreateValue,
  } = useForm<CreateChallanFormData>({
    resolver: zodResolver(createChallanSchema),
    defaultValues: {
      customerId: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });

  // Sync lineItems into form
  useEffect(() => {
    setCreateValue('items', lineItems);
  }, [lineItems, setCreateValue]);

  const onSubmitCreate = (data: CreateChallanFormData) => {
    createMutation.mutate(data);
  };

  // ─── Line item helpers ─────────────────────────────────────────────────

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // ─── Compute totals for create form preview ────────────────────────────

  const computedItems = lineItems.map((li) => {
    const product = products.find((p) => p.id === li.productId);
    if (!product) return { subtotal: 0, gst: 0, total: 0 };
    const subtotal = product.sellingPrice * li.quantity;
    const gst = (subtotal * product.gstPercentage) / 100;
    return { subtotal, gst, total: subtotal + gst };
  });

  const grandSubtotal = computedItems.reduce((s, i) => s + i.subtotal, 0);
  const grandGst = computedItems.reduce((s, i) => s + i.gst, 0);
  const grandTotal = computedItems.reduce((s, i) => s + i.total, 0);

  // ─── View challan totals ───────────────────────────────────────────────

  const getViewTotals = (challan: SalesChallan) => {
    // The backend stores product.gstPercentage but the item snapshot does not include gst
    // We calculate GST from the products dropdown data to show an estimated GST
    const subtotal = challan.items.reduce((s, item) => s + item.sellingPrice * item.quantity, 0);
    const gst = challan.totalAmount - subtotal;
    return { subtotal, gst: gst > 0 ? gst : 0, total: challan.totalAmount };
  };

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleView = (challan: SalesChallan) => {
    setSelectedChallan(challan);
    setShowViewModal(true);
    setActionMenuOpen(null);
  };

  const handleStatusChange = (challan: SalesChallan, status: 'CONFIRMED' | 'CANCELLED') => {
    setSelectedChallan(challan);
    setNewStatus(status);
    setShowStatusModal(true);
    setActionMenuOpen(null);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCustomerFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters = search || statusFilter || customerFilter || startDate || endDate;

  // ─── Export to CSV ─────────────────────────────────────────────────────

  const exportToCSV = () => {
    if (!challans.length) return;
    const headers = [
      'Challan No.',
      'Customer',
      'Business',
      'Date',
      'Items Count',
      'Total Qty',
      'Total Amount',
      'Status',
    ];
    const rows = challans.map((c) => [
      c.challanNumber,
      c.customerName,
      c.businessName,
      formatDate(c.createdAt),
      c.items.length,
      c.totalQuantity,
      c.totalAmount,
      c.status,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `sales-challans-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* ── Page Header ── */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Challans</h1>
              <p className="text-gray-600">Create, manage and track sales challans</p>
            </div>
            {user?.role !== 'ACCOUNTS' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#16213e] transition-colors whitespace-nowrap"
              >
                <Plus className="h-5 w-5" />
                Create Sales Challan
              </button>
            )}
          </div>

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Challans */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Challans</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalSales ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Draft */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Draft</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {statsLoading ? '-' : stats?.draftSales ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Confirmed */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statsLoading ? '-' : stats?.confirmedSales ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600">
                    {statsLoading ? '-' : stats?.cancelledSales ?? 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Filters bar ── */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search challan no. or customer..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none w-full sm:w-64 text-sm"
                  />
                </div>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm"
                >
                  <option value="">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                {/* Customer filter */}
                <select
                  value={customerFilter}
                  onChange={(e) => { setCustomerFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm max-w-[200px]"
                >
                  <option value="">All Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.customerName}
                    </option>
                  ))}
                </select>

                {/* Date range */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm"
                  />
                </div>

                {/* Clear */}
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Export */}
              <button
                onClick={exportToCSV}
                disabled={challans.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {challansLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1a2e]" />
              </div>
            ) : challansError ? (
              <div className="p-8 text-center">
                <p className="text-red-600 font-medium mb-2">Failed to load challans</p>
                <button
                  onClick={() => refetch()}
                  className="text-sm text-[#1a1a2e] font-medium hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : challans.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-1">
                  {hasFilters ? 'No challans match your filters.' : 'No sales challans yet.'}
                </p>
                <p className="text-gray-400 text-sm">
                  {hasFilters
                    ? 'Try adjusting your filters.'
                    : 'Create your first sales challan to get started.'}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-3 text-sm text-[#1a1a2e] font-medium hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Challan No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          GST
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {challans.map((challan) => {
                        const viewTotals = getViewTotals(challan);
                        return (
                          <tr
                            key={challan.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Challan No */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-[#1a1a2e]">
                                {challan.challanNumber}
                              </span>
                            </td>

                            {/* Customer */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-medium text-gray-900">
                                {challan.customerName}
                              </p>
                              <p className="text-xs text-gray-500">{challan.businessName}</p>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(challan.createdAt)}
                            </td>

                            {/* Items count */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center justify-center min-w-[28px] h-7 bg-gray-100 text-gray-700 text-sm font-medium rounded-full px-2">
                                {challan.items.length}
                              </span>
                            </td>

                            {/* Subtotal */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(viewTotals.subtotal)}
                            </td>

                            {/* GST */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                              {formatCurrency(viewTotals.gst)}
                            </td>

                            {/* Total */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                              {formatCurrency(challan.totalAmount)}
                            </td>

                            {/* Status badge */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getChallanStatusColor(challan.status)}`}
                              >
                                {getChallanStatusIcon(challan.status)}
                                {challan.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="relative inline-block">
                                <button
                                  onClick={() =>
                                    setActionMenuOpen(
                                      actionMenuOpen === challan.id ? null : challan.id
                                    )
                                  }
                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="h-5 w-5 text-gray-500" />
                                </button>

                                {actionMenuOpen === challan.id && (
                                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                    {/* View */}
                                    <button
                                      onClick={() => handleView(challan)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </button>

                                    {/* Confirm — only ADMIN, only DRAFT */}
                                    {isAdmin && challan.status === 'DRAFT' && (
                                      <button
                                        onClick={() => handleStatusChange(challan, 'CONFIRMED')}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-50"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Confirm Challan
                                      </button>
                                    )}

                                    {/* Cancel — only ADMIN, not already cancelled */}
                                    {isAdmin && challan.status !== 'CANCELLED' && (
                                      <button
                                        onClick={() => handleStatusChange(challan, 'CANCELLED')}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Cancel Challan
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}{' '}
                    challans
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="px-3 py-1 text-sm">
                      Page {page} of {totalPages || 1}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CREATE MODAL                                                       */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-3xl my-8 shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create Sales Challan</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Select a customer and add products to the challan
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreate();
                  setLineItems([{ productId: '', quantity: 1 }]);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
              <div className="p-6 space-y-6">
                {/* Customer selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...registerCreate('customerId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm"
                  >
                    <option value="">Select a customer...</option>
                    {customers
                      .filter((c) => c.status === 'ACTIVE' || c.status === 'LEAD')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName} — {c.businessName}
                        </option>
                      ))}
                  </select>
                  {createErrors.customerId && (
                    <p className="text-red-500 text-xs mt-1">
                      {createErrors.customerId.message}
                    </p>
                  )}
                </div>

                {/* Line items */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Products <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addLineItem}
                      className="flex items-center gap-1 text-sm text-[#1a1a2e] hover:underline font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-12 gap-2 bg-gray-50 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2 text-center">Qty</div>
                      <div className="col-span-2 text-right">Price</div>
                      <div className="col-span-2 text-right">Amount</div>
                      <div className="col-span-1" />
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-100">
                      {lineItems.map((item, index) => {
                        const selectedProduct = products.find((p) => p.id === item.productId);
                        const lineSubtotal = selectedProduct
                          ? selectedProduct.sellingPrice * item.quantity
                          : 0;
                        return (
                          <div
                            key={index}
                            className="grid grid-cols-12 gap-2 px-4 py-3 items-center"
                          >
                            {/* Product select */}
                            <div className="col-span-5">
                              <select
                                value={item.productId}
                                onChange={(e) => updateLineItem(index, 'productId', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm"
                              >
                                <option value="">Select product...</option>
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.productName} ({p.productCode}) — Stock: {p.stockQuantity}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quantity */}
                            <div className="col-span-2">
                              <input
                                type="number"
                                min={1}
                                max={selectedProduct?.stockQuantity ?? undefined}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)
                                }
                                className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#1a1a2e] focus:border-transparent outline-none text-sm text-center"
                              />
                            </div>

                            {/* Unit price */}
                            <div className="col-span-2 text-right text-sm text-gray-600">
                              {selectedProduct ? formatCurrency(selectedProduct.sellingPrice) : '—'}
                            </div>

                            {/* Line total */}
                            <div className="col-span-2 text-right text-sm font-medium text-gray-900">
                              {lineSubtotal > 0 ? formatCurrency(lineSubtotal) : '—'}
                            </div>

                            {/* Remove */}
                            <div className="col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeLineItem(index)}
                                disabled={lineItems.length === 1}
                                className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {createErrors.items && (
                    <p className="text-red-500 text-xs mt-1">
                      {typeof createErrors.items.message === 'string'
                        ? createErrors.items.message
                        : 'Please fill all product fields'}
                    </p>
                  )}
                </div>

                {/* Order summary */}
                {grandSubtotal > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatCurrency(grandSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>GST</span>
                      <span>{formatCurrency(grandGst)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                      <span>Grand Total</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreate();
                    setLineItems([{ productId: '', quantity: 1 }]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 bg-[#1a1a2e] text-white px-6 py-2 rounded-lg hover:bg-[#16213e] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Challan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIEW MODAL                                                          */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showViewModal && selectedChallan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-3xl my-8 shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedChallan.challanNumber}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${getChallanStatusColor(
                      selectedChallan.status
                    )}`}
                  >
                    {getChallanStatusIcon(selectedChallan.status)}
                    {selectedChallan.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(selectedChallan.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedChallan(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase font-medium">Customer Name</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedChallan.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase font-medium">Business Name</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedChallan.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase font-medium">Date</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedChallan.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 uppercase font-medium">Total Qty</p>
                  <p className="text-sm text-gray-900">{selectedChallan.totalQuantity} units</p>
                </div>
              </div>

              {/* Items table */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Code
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedChallan.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{item.productCode}</td>
                          <td className="px-4 py-3 text-center text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatCurrency(item.sellingPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              {(() => {
                const vt = getViewTotals(selectedChallan);
                return (
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(vt.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>GST</span>
                        <span>{formatCurrency(vt.gst)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                        <span>Total Amount</span>
                        <span>{formatCurrency(selectedChallan.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Status actions inside view modal for ADMIN */}
              {isAdmin && selectedChallan.status === 'DRAFT' && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mr-auto">Update status:</p>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleStatusChange(selectedChallan, 'CONFIRMED');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirm
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleStatusChange(selectedChallan, 'CANCELLED');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
              {isAdmin && selectedChallan.status === 'CONFIRMED' && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mr-auto">Update status:</p>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleStatusChange(selectedChallan, 'CANCELLED');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel Challan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* STATUS CONFIRM MODAL                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {showStatusModal && selectedChallan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {newStatus === 'CONFIRMED' ? 'Confirm Challan' : 'Cancel Challan'}
              </h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedChallan(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div
                className={`flex items-center gap-3 p-4 rounded-lg mb-4 ${newStatus === 'CONFIRMED' ? 'bg-green-50' : 'bg-red-50'
                  }`}
              >
                {newStatus === 'CONFIRMED' ? (
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`font-medium ${newStatus === 'CONFIRMED' ? 'text-green-800' : 'text-red-800'
                      }`}
                  >
                    {newStatus === 'CONFIRMED'
                      ? 'Confirm this challan?'
                      : 'Cancel this challan?'}
                  </p>
                  <p
                    className={`text-sm mt-1 ${newStatus === 'CONFIRMED' ? 'text-green-700' : 'text-red-700'
                      }`}
                  >
                    {newStatus === 'CONFIRMED'
                      ? 'Stock will be deducted from inventory once confirmed.'
                      : 'This action will restore stock if the challan was confirmed.'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 mb-4">
                <p>
                  <span className="font-medium">Challan:</span>{' '}
                  {selectedChallan.challanNumber}
                </p>
                <p>
                  <span className="font-medium">Customer:</span>{' '}
                  {selectedChallan.customerName}
                </p>
                <p>
                  <span className="font-medium">Amount:</span>{' '}
                  {formatCurrency(selectedChallan.totalAmount)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedChallan(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Go Back
                </button>
                <button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedChallan.id,
                      status: newStatus,
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                  className={`flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed ${newStatus === 'CONFIRMED'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {updateStatusMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Updating...
                    </>
                  ) : newStatus === 'CONFIRMED' ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Confirm
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      Cancel Challan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close action menus when clicking outside */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
}
