import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/api';
import Sidebar from '../components/dashboard/Sidebar';
import Navbar from '../components/dashboard/Navbar';
import toast from 'react-hot-toast';
import {
  Search,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

const customerSchema = z.object({
  customerCode: z.string().min(2, 'Customer code must be at least 2 characters'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

const editCustomerSchema = z.object({
  customerCode: z.string().min(2, 'Customer code must be at least 2 characters'),
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  customerType: z.enum(['RETAIL', 'WHOLESALE', 'DISTRIBUTOR']),
  status: z.enum(['LEAD', 'ACTIVE', 'INACTIVE']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;
type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  businessName: string;
  mobile: string;
  email: string | null;
  gstNumber: string | null;
  customerType: 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  address: string;
  followUpDate: string | null;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FollowUp {
  id: string;
  customerId: string;
  notes: string;
  followUpDate: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  leadCustomers: number;
  inactiveCustomers: number;
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
}

export default function Customers() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Search and filter state
  const [search, setSearch] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Fetch customer statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const response = await api.get<{ data: CustomerStats }>('/dashboard/summary');
      return response.data.data;
    },
  });

  // Fetch customers
  const { data: customersData, isLoading: customersLoading, refetch } = useQuery({
    queryKey: ['customers', page, search, customerType, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (customerType) params.append('customerType', customerType);
      if (status) params.append('status', status);

      const response = await api.get<{ data: CustomersResponse }>(`/customers?${params}`);
      return response.data.data;
    },
  });

  const customers = customersData?.customers || [];
  const total = customersData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Fetch follow-ups for selected customer
  const { data: followUps, refetch: refetchFollowUps } = useQuery({
    queryKey: ['follow-ups', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const response = await api.get<{ data: FollowUp[] }>(`/customers/${selectedCustomer.id}/follow-ups`);
      return response.data.data;
    },
    enabled: !!selectedCustomer && showViewModal,
  });

  // Add follow-up mutation
  const addFollowUpMutation = useMutation({
    mutationFn: async (data: { notes: string; followUpDate?: string }) => {
      if (!selectedCustomer) throw new Error('No customer selected');
      await api.post(`/customers/${selectedCustomer.id}/follow-ups`, data);
    },
    onSuccess: () => {
      toast.success('Follow-up added successfully');
      setShowAddFollowUpModal(false);
      refetchFollowUps();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add follow-up');
    },
  });

  const {
    register: registerFollowUp,
    handleSubmit: handleSubmitFollowUp,
    formState: { errors: followUpErrors },
    reset: resetFollowUp,
  } = useForm<{ notes: string; followUpDate?: string }>({
    defaultValues: {},
  });

  const onSubmitFollowUp = (data: { notes: string; followUpDate?: string }) => {
    addFollowUpMutation.mutate(data);
  };

  // Add customer mutation
  const addMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      await api.post('/customers', data);
    },
    onSuccess: () => {
      toast.success('Customer created successfully');
      setShowAddModal(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create customer');
    },
  });

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAdd,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmitAdd = (data: CustomerFormData) => {
    addMutation.mutate(data);
  };

  // Edit customer mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditCustomerFormData }) => {
      await api.put(`/customers/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Customer updated successfully');
      setShowEditModal(false);
      setSelectedCustomer(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<EditCustomerFormData>({
    resolver: zodResolver(editCustomerSchema),
  });

  const onSubmitEdit = (data: EditCustomerFormData) => {
    if (selectedCustomer) {
      editMutation.mutate({ id: selectedCustomer.id, data });
    }
  };

  // Load customer data into edit form when modal opens
  useEffect(() => {
    if (showEditModal && selectedCustomer) {
      setEditValue('customerCode', selectedCustomer.customerCode);
      setEditValue('customerName', selectedCustomer.customerName);
      setEditValue('businessName', selectedCustomer.businessName);
      setEditValue('mobile', selectedCustomer.mobile);
      setEditValue('email', selectedCustomer.email || '');
      setEditValue('customerType', selectedCustomer.customerType);
      setEditValue('status', selectedCustomer.status);
      setEditValue('address', selectedCustomer.address);
      setEditValue('followUpDate', selectedCustomer.followUpDate ? selectedCustomer.followUpDate.split('T')[0] : '');
      setEditValue('notes', selectedCustomer.notes || '');
    }
  }, [showEditModal, selectedCustomer, setEditValue]);
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['customer-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    },
  });

  const handleDelete = () => {
    if (selectedCustomer) {
      deleteMutation.mutate(selectedCustomer.id);
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
    setActionMenuOpen(null);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
    setActionMenuOpen(null);
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const clearFilters = () => {
    setSearch('');
    setCustomerType('');
    setStatus('');
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'LEAD':
        return 'bg-blue-100 text-blue-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'RETAIL':
        return 'bg-purple-100 text-purple-800';
      case 'WHOLESALE':
        return 'bg-orange-100 text-orange-800';
      case 'DISTRIBUTOR':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Customers</h1>
            <p className="text-gray-600">Manage your customer relationships</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {statsLoading ? '-' : stats?.totalCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Customers</p>
                  <p className="text-3xl font-bold text-green-600">
                    {statsLoading ? '-' : stats?.activeCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Leads</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statsLoading ? '-' : stats?.leadCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {statsLoading ? '-' : stats?.inactiveCustomers || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏸</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filters, and Add Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none w-full sm:w-64"
                  />
                </div>

                {/* Customer Type Filter */}
                <select
                  value={customerType}
                  onChange={(e) => {
                    setCustomerType(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                >
                  <option value="">All Types</option>
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>

                {/* Status Filter */}
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                >
                  <option value="">All Status</option>
                  <option value="LEAD">Lead</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                {/* Clear Filters */}
                {(search || customerType || status) && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Add Customer Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add Customer
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {customersLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1a2e]"></div>
              </div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  {search || customerType || status
                    ? 'No customers match your search criteria.'
                    : 'No customers found.'}
                </p>
                <p className="text-gray-500 mb-4">
                  {search || customerType || status
                    ? 'Try adjusting your filters.'
                    : 'Start by adding your first customer.'}
                </p>
                {(search || customerType || status) && (
                  <button
                    onClick={clearFilters}
                    className="text-[#1a1a2e] font-medium hover:underline"
                  >
                    Clear Search
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
                          Customer Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Follow-up Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.customerCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {customer.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.businessName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.mobile}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(customer.customerType)}`}>
                              {customer.customerType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(customer.followUpDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="relative inline-block">
                              <button
                                onClick={() => setActionMenuOpen(actionMenuOpen === customer.id ? null : customer.id)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="h-5 w-5 text-gray-500" />
                              </button>
                              {actionMenuOpen === customer.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                  <button
                                    onClick={() => handleView(customer)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEdit(customer)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(customer)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} customers
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
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
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

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedCustomer(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Code</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.customerCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Business Name</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mobile</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Type</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedCustomer.customerType)}`}>
                    {selectedCustomer.customerType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Follow-up Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedCustomer.followUpDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.notes || '-'}</p>
                </div>
              </div>

              {/* Follow-ups Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Follow-ups</h3>
                  <button
                    onClick={() => {
                      setShowAddFollowUpModal(true);
                      resetFollowUp();
                    }}
                    className="flex items-center gap-2 text-sm bg-[#1a1a2e] text-white px-3 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Follow-up
                  </button>
                </div>
                
                {followUps && followUps.length > 0 ? (
                  <div className="space-y-3">
                    {followUps.map((followUp) => (
                      <div key={followUp.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm text-gray-900 font-medium">{followUp.notes}</p>
                          <p className="text-xs text-gray-500">{formatDate(followUp.createdAt)}</p>
                        </div>
                        {followUp.followUpDate && (
                          <p className="text-xs text-gray-600">
                            Follow-up: {formatDate(followUp.followUpDate)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No follow-ups recorded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {showAddFollowUpModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Follow-up</h2>
              <button
                onClick={() => {
                  setShowAddFollowUpModal(false);
                  resetFollowUp();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitFollowUp(onSubmitFollowUp)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes *
                  </label>
                  <textarea
                    {...registerFollowUp('notes', { required: 'Notes are required' })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="Follow-up notes..."
                  />
                  {followUpErrors.notes && (
                    <p className="text-sm text-red-600 mt-1">{followUpErrors.notes.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    {...registerFollowUp('followUpDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFollowUpModal(false);
                    resetFollowUp();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addFollowUpMutation.isPending}
                  className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addFollowUpMutation.isPending ? 'Adding...' : 'Add Follow-up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete customer?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Customer</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAdd();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Code *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('customerCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="CUST001"
                  />
                  {addErrors.customerCode && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.customerCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('customerName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                  {addErrors.customerName && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('businessName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="ABC Enterprises"
                  />
                  {addErrors.businessName && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.businessName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="+1234567890"
                  />
                  {addErrors.mobile && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.mobile.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...registerAdd('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="john@example.com"
                  />
                  {addErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    {...registerAdd('customerType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                  {addErrors.customerType && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.customerType.message}</p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    {...registerAdd('address')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="123 Main Street, City, State"
                  />
                  {addErrors.address && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.address.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    {...registerAdd('followUpDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    {...registerAdd('notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="Additional notes about the customer..."
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAdd();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addMutation.isPending ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                  resetEdit();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Code *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('customerCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="CUST001"
                  />
                  {editErrors.customerCode && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.customerCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('customerName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                  {editErrors.customerName && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.customerName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('businessName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="ABC Enterprises"
                  />
                  {editErrors.businessName && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.businessName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('mobile')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="+1234567890"
                  />
                  {editErrors.mobile && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.mobile.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...registerEdit('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="john@example.com"
                  />
                  {editErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type *
                  </label>
                  <select
                    {...registerEdit('customerType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">Select type</option>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                  {editErrors.customerType && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.customerType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    {...registerEdit('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    {...registerEdit('address')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="123 Main Street, City, State"
                  />
                  {editErrors.address && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.address.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    {...registerEdit('followUpDate')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    {...registerEdit('notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="Additional notes about the customer..."
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCustomer(null);
                    resetEdit();
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editMutation.isPending ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
