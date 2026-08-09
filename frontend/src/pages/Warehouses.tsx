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
  Eye,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

const warehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name must be at least 2 characters').max(100, 'Warehouse name must not exceed 100 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(200, 'Location must not exceed 200 characters'),
  isActive: z.boolean().optional(),
});

const editWarehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name must be at least 2 characters').max(100, 'Warehouse name must not exceed 100 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(200, 'Location must not exceed 200 characters'),
  isActive: z.boolean(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;
type EditWarehouseFormData = z.infer<typeof editWarehouseSchema>;

interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WarehouseStats {
  totalWarehouses: number;
  activeWarehouses: number;
  totalProducts: number;
  lowStockItems: number;
}

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Fetch warehouses
  const { data: warehouses = [], isLoading, refetch } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');
      return response.data.data as Warehouse[];
    },
  });

  // Fetch warehouse statistics
  const { data: stats } = useQuery({
    queryKey: ['warehouse-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      const data = response.data.data;
      return {
        totalWarehouses: data.totalWarehouses || 0,
        activeWarehouses: data.activeWarehouses || 0,
        totalProducts: data.totalProducts || 0,
        lowStockItems: data.lowStockProducts || 0,
      } as WarehouseStats;
    },
  });

  // Fetch products for warehouse counts
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data.data.products || [];
    },
  });

  // Add warehouse mutation
  const addMutation = useMutation({
    mutationFn: async (data: WarehouseFormData) => {
      await api.post('/warehouses', data);
    },
    onSuccess: () => {
      toast.success('Warehouse created successfully');
      setShowAddModal(false);
      resetAdd();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['warehouse-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create warehouse');
    },
  });

  // Edit warehouse mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditWarehouseFormData }) => {
      await api.put(`/warehouses/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Warehouse updated successfully');
      setShowEditModal(false);
      setSelectedWarehouse(null);
      resetEdit();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['warehouse-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update warehouse');
    },
  });

  // Delete warehouse mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/warehouses/${id}`);
    },
    onSuccess: () => {
      toast.success('Warehouse deleted successfully');
      setShowDeleteModal(false);
      setSelectedWarehouse(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['warehouse-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete warehouse');
    },
  });

  // Add form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAdd,
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const onSubmitAdd = (data: WarehouseFormData) => {
    addMutation.mutate(data);
  };

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<EditWarehouseFormData>({
    resolver: zodResolver(editWarehouseSchema),
  });

  const onSubmitEdit = (data: EditWarehouseFormData) => {
    if (selectedWarehouse) {
      editMutation.mutate({ id: selectedWarehouse.id, data });
    }
  };

  // Load warehouse data into edit form when modal opens
  useEffect(() => {
    if (showEditModal && selectedWarehouse) {
      setEditValue('name', selectedWarehouse.name);
      setEditValue('location', selectedWarehouse.location);
      setEditValue('isActive', selectedWarehouse.isActive);
    }
  }, [showEditModal, selectedWarehouse, setEditValue]);

  const handleDelete = () => {
    if (selectedWarehouse) {
      deleteMutation.mutate(selectedWarehouse.id);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get product count for a warehouse
  const getProductCount = (warehouseId: string) => {
    return products.filter((p: any) => p.warehouseId === warehouseId).length;
  };

  // Get low stock count for a warehouse
  const getLowStockCount = (warehouseId: string) => {
    return products.filter((p: any) =>
      p.warehouseId === warehouseId && p.stockQuantity <= p.minimumStock
    ).length;
  };

  // Filter warehouses
  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(search.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === '' ||
      (statusFilter === 'ACTIVE' && warehouse.isActive) ||
      (statusFilter === 'INACTIVE' && !warehouse.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Breadcrumb */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">NexaERP <span className="mx-2">&gt;</span> Warehouses</p>
          </div>

          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
              <p className="text-gray-600">Manage warehouses, locations and inventory storage</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
            >
              <Plus className="h-5 w-5" />
              Add Warehouse
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Warehouses</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalWarehouses || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Active Warehouses</p>
              <p className="text-3xl font-bold text-green-600">{stats?.activeWarehouses || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.totalProducts || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.lowStockItems || 0}</p>
            </div>
          </div>

          {/* Warehouse List Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Warehouse List</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search warehouses..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none w-full sm:w-64"
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>

                  {/* Clear Filters */}
                  {(search || statusFilter) && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1a2e]"></div>
                </div>
              ) : filteredWarehouses.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    {search || statusFilter
                      ? 'No warehouses match your search criteria.'
                      : 'No warehouses found.'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    {search || statusFilter
                      ? 'Try adjusting your filters.'
                      : 'Start by adding your first warehouse.'}
                  </p>
                  {(search || statusFilter) && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('');
                      }}
                      className="text-[#1a1a2e] hover:text-[#16213e] font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredWarehouses.map((warehouse) => (
                      <tr key={warehouse.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{warehouse.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{warehouse.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getProductCount(warehouse.id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getLowStockCount(warehouse.id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(warehouse.isActive)}`}>
                            {warehouse.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(warehouse.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                setShowViewModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                setShowEditModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWarehouse(warehouse);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Warehouse Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Warehouse</h2>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Main Warehouse"
                  />
                  {addErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Industrial Area, Zone 1"
                  />
                  {addErrors.location && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.location.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...registerAdd('isActive')}
                    className="w-4 h-4 text-[#1a1a2e] border-gray-300 rounded focus:ring-[#1a1a2e]"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAdd();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] transition-colors disabled:opacity-50"
                >
                  {addMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Warehouse Modal */}
      {showEditModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Warehouse</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedWarehouse(null);
                  resetEdit();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  />
                  {editErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('location')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  />
                  {editErrors.location && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.location.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...registerEdit('isActive')}
                    className="w-4 h-4 text-[#1a1a2e] border-gray-300 rounded focus:ring-[#1a1a2e]"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedWarehouse(null);
                    resetEdit();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#16213e] transition-colors disabled:opacity-50"
                >
                  {editMutation.isPending ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Warehouse Modal */}
      {showViewModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Warehouse Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedWarehouse(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Warehouse Name</p>
                  <p className="font-medium text-gray-900">{selectedWarehouse.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedWarehouse.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedWarehouse.isActive)}`}>
                    {selectedWarehouse.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Products</p>
                  <p className="font-medium text-gray-900">{getProductCount(selectedWarehouse.id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                  <p className="font-medium text-gray-900">{getLowStockCount(selectedWarehouse.id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedWarehouse.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWarehouse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Warehouse</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete warehouse <strong>{selectedWarehouse.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedWarehouse(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
