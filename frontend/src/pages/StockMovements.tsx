import { useState } from 'react';
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
  Download,
  X,
} from 'lucide-react';

const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().min(1, 'Quantity must be greater than 0'),
  movementType: z.enum(['IN', 'OUT', 'TRANSFER']),
  reason: z.string().optional(),
  fromWarehouseId: z.string().optional(),
  toWarehouseId: z.string().optional(),
}).refine((data) => {
  if (data.movementType === 'IN' && !data.toWarehouseId) {
    return false;
  }
  if (data.movementType === 'OUT' && !data.fromWarehouseId) {
    return false;
  }
  if (data.movementType === 'TRANSFER' && (!data.fromWarehouseId || !data.toWarehouseId)) {
    return false;
  }
  if (data.movementType === 'TRANSFER' && data.fromWarehouseId === data.toWarehouseId) {
    return false;
  }
  return true;
}, {
  message: 'Warehouse selection is invalid for this movement type',
});

type StockMovementFormData = z.infer<typeof stockMovementSchema>;

interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: string;
  status: string;
  reason: string | null;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  stockQuantity: number;
  warehouseId: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

interface StockMovementStats {
  totalStockMovements: number;
  stockInMovements: number;
  stockOutMovements: number;
  transferMovements: number;
}

export default function StockMovements() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

  // Fetch stock movements
  const { data: movements = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const response = await api.get('/stock-movements');
      return response.data.data as StockMovement[];
    },
  });

  // Fetch stock movement statistics
  const { data: stats } = useQuery({
    queryKey: ['stock-movement-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      const data = response.data.data;
      return {
        totalStockMovements: data.totalStockMovements || 0,
        stockInMovements: data.stockInMovements || 0,
        stockOutMovements: data.stockOutMovements || 0,
        transferMovements: data.transferMovements || 0,
      } as StockMovementStats;
    },
  });

  // Fetch products
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data.data.products || [];
    },
  });

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');
      return response.data.data as Warehouse[];
    },
  });

  // Add stock movement mutation
  const addMutation = useMutation({
    mutationFn: async (data: StockMovementFormData) => {
      await api.post('/stock-movements', data);
    },
    onSuccess: () => {
      toast.success('Stock movement created successfully');
      setShowAddModal(false);
      resetAdd();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['stock-movement-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create stock movement');
    },
  });

  // Add form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAdd,
    watch,
    setValue: setAddValue,
  } = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      movementType: 'IN',
    },
  });

  const movementType = watch('movementType');

  const onSubmitAdd = (data: StockMovementFormData) => {
    addMutation.mutate(data);
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-blue-100 text-blue-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMovementId = (id: string) => {
    return `MOV-${id.slice(-5).toUpperCase()}`;
  };

  const getProductName = (productId: string) => {
    const product = products.find((p: Product) => p.id === productId);
    return product ? `${product.productCode} - ${product.productName}` : productId;
  };

  const getWarehouseName = (warehouseId: string | null) => {
    if (!warehouseId) return '—';
    const warehouse = warehouses.find((w: Warehouse) => w.id === warehouseId);
    return warehouse ? warehouse.name : warehouseId;
  };

  // Filter movements
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch = 
      movement.id.toLowerCase().includes(search.toLowerCase()) ||
      getProductName(movement.productId).toLowerCase().includes(search.toLowerCase());
    const matchesType = 
      typeFilter === '' || 
      movement.movementType === typeFilter;
    const matchesWarehouse = 
      warehouseFilter === '' || 
      movement.fromWarehouseId === warehouseFilter ||
      movement.toWarehouseId === warehouseFilter;
    return matchesSearch && matchesType && matchesWarehouse;
  });

  const exportToCSV = () => {
    if (!movements.length) return;
    
    const headers = ['ID', 'Product', 'Type', 'Quantity', 'From Warehouse', 'To Warehouse', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...movements.map(movement => [
        getMovementId(movement.id),
        getProductName(movement.productId),
        movement.movementType,
        movement.quantity,
        getWarehouseName(movement.fromWarehouseId),
        getWarehouseName(movement.toWarehouseId),
        movement.status,
        formatDate(movement.createdAt),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'stock-movements.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col lg:ml-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* Breadcrumb */}
          <div className="mb-4">
            <p className="text-sm text-gray-600">NexaERP <span className="mx-2">&gt;</span> Stock Movements</p>
          </div>

          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
              <p className="text-gray-600">Track inventory transfers, stock additions and stock reductions</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
            >
              <Plus className="h-5 w-5" />
              New Stock Movement
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Movements</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalStockMovements || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Stock In</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.stockInMovements || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Stock Out</p>
              <p className="text-3xl font-bold text-red-600">{stats?.stockOutMovements || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Transfers</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.transferMovements || 0}</p>
            </div>
          </div>

          {/* Stock Movement History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Stock Movement History</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search ID or Product..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none w-full sm:w-64"
                    />
                  </div>

                  {/* Movement Type Filter */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">All Movement Types</option>
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>

                  {/* Warehouse Filter */}
                  <select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map((wh: Warehouse) => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>

                  {/* Clear Filters */}
                  {(search || typeFilter || warehouseFilter) && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setTypeFilter('');
                        setWarehouseFilter('');
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}

                  {/* Export */}
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1a2e]"></div>
                </div>
              ) : filteredMovements.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-4">
                    {search || typeFilter || warehouseFilter
                      ? 'No stock movements match your search criteria.'
                      : 'No stock movements found.'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    {search || typeFilter || warehouseFilter
                      ? 'Try adjusting your filters.'
                      : 'Start by creating your first stock movement.'}
                  </p>
                  {(search || typeFilter || warehouseFilter) && (
                    <button
                      onClick={() => {
                        setSearch('');
                        setTypeFilter('');
                        setWarehouseFilter('');
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMovements.map((movement) => (
                      <tr key={movement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getMovementId(movement.id)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getProductName(movement.productId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMovementTypeColor(movement.movementType)}`}>
                            {movement.movementType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {movement.movementType === 'OUT' ? '-' : movement.movementType === 'IN' ? '+' : ''}{movement.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getWarehouseName(movement.fromWarehouseId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getWarehouseName(movement.toWarehouseId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(movement.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(movement.status)}`}>
                            {movement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => {
                              setSelectedMovement(movement);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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

      {/* Add Stock Movement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Stock Movement</h2>
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
                    Movement Type *
                  </label>
                  <select
                    {...registerAdd('movementType')}
                    onChange={(e) => {
                      setAddValue('movementType', e.target.value as 'IN' | 'OUT' | 'TRANSFER');
                      setAddValue('fromWarehouseId', '');
                      setAddValue('toWarehouseId', '');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="IN">Stock In</option>
                    <option value="OUT">Stock Out</option>
                    <option value="TRANSFER">Transfer</option>
                  </select>
                  {addErrors.movementType && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.movementType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product *
                  </label>
                  <select
                    {...registerAdd('productId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">Select Product</option>
                    {products.map((product: Product) => (
                      <option key={product.id} value={product.id}>
                        {product.productCode} - {product.productName}
                      </option>
                    ))}
                  </select>
                  {addErrors.productId && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.productId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    {...registerAdd('quantity', { valueAsNumber: true })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Enter quantity"
                  />
                  {addErrors.quantity && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.quantity.message}</p>
                  )}
                </div>

                {movementType === 'IN' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Warehouse *
                    </label>
                    <select
                      {...registerAdd('toWarehouseId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh: Warehouse) => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                      ))}
                    </select>
                    {addErrors.toWarehouseId && (
                      <p className="text-sm text-red-600 mt-1">Destination warehouse is required</p>
                    )}
                  </div>
                )}

                {movementType === 'OUT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Warehouse *
                    </label>
                    <select
                      {...registerAdd('fromWarehouseId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouses.map((wh: Warehouse) => (
                        <option key={wh.id} value={wh.id}>{wh.name}</option>
                      ))}
                    </select>
                    {addErrors.fromWarehouseId && (
                      <p className="text-sm text-red-600 mt-1">Source warehouse is required</p>
                    )}
                  </div>
                )}

                {movementType === 'TRANSFER' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Warehouse *
                      </label>
                      <select
                        {...registerAdd('fromWarehouseId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((wh: Warehouse) => (
                          <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                      </select>
                      {addErrors.fromWarehouseId && (
                        <p className="text-sm text-red-600 mt-1">Source warehouse is required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Warehouse *
                      </label>
                      <select
                        {...registerAdd('toWarehouseId')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                      >
                        <option value="">Select Warehouse</option>
                        {warehouses.map((wh: Warehouse) => (
                          <option key={wh.id} value={wh.id}>{wh.name}</option>
                        ))}
                      </select>
                      {addErrors.toWarehouseId && (
                        <p className="text-sm text-red-600 mt-1">Destination warehouse is required</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference / Reason
                  </label>
                  <input
                    type="text"
                    {...registerAdd('reason')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Optional reference or reason"
                  />
                  {addErrors.reason && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.reason.message}</p>
                  )}
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
                  {addMutation.isPending ? 'Creating...' : 'Create Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Stock Movement Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedMovement(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Movement ID</p>
                  <p className="font-medium text-gray-900">{getMovementId(selectedMovement.id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product</p>
                  <p className="font-medium text-gray-900">{getProductName(selectedMovement.productId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Movement Type</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMovementTypeColor(selectedMovement.movementType)}`}>
                    {selectedMovement.movementType}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quantity</p>
                  <p className="font-medium text-gray-900">{selectedMovement.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Source Warehouse</p>
                  <p className="font-medium text-gray-900">{getWarehouseName(selectedMovement.fromWarehouseId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Destination Warehouse</p>
                  <p className="font-medium text-gray-900">{getWarehouseName(selectedMovement.toWarehouseId)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reference / Reason</p>
                  <p className="font-medium text-gray-900">{selectedMovement.reason || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMovement.status)}`}>
                    {selectedMovement.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedMovement.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
