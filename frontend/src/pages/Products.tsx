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
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
} from 'lucide-react';

const productSchema = z.object({
  productCode: z.string().min(2, 'Product code must be at least 2 characters'),
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  gstPercentage: z.number().min(0, 'GST percentage must be non-negative').optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative').optional(),
  minimumStock: z.number().int().min(0, 'Minimum stock must be non-negative').optional(),
  description: z.string().optional(),
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

const editProductSchema = z.object({
  productCode: z.string().min(2, 'Product code must be at least 2 characters'),
  productName: z.string().min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  purchasePrice: z.number().min(0, 'Purchase price must be non-negative'),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  gstPercentage: z.number().min(0, 'GST percentage must be non-negative').optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity must be non-negative').optional(),
  minimumStock: z.number().int().min(0, 'Minimum stock must be non-negative').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

type ProductFormData = z.infer<typeof productSchema>;
type EditProductFormData = z.infer<typeof editProductSchema>;

interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercentage: number;
  stockQuantity: number;
  minimumStock: number;
  description: string | null;
  status: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outofStockProducts: number;
}

interface ProductsResponse {
  products: Product[];
  total: number;
}

export default function Products() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const role = user?.role;

  // Search and filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products with filters and pagination
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['products', search, category, status, warehouseId, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      if (warehouseId) params.append('warehouseId', warehouseId);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await api.get(`/products?${params.toString()}`);
      return response.data.data as ProductsResponse;
    },
  });

  // Fetch product statistics
  const { data: stats } = useQuery({
    queryKey: ['product-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/summary');
      const data = response.data.data;
      return {
        totalProducts: data.totalProducts || 0,
        activeProducts: data.activeProducts || 0,
        lowStockProducts: data.lowStockProducts || 0,
        outofStockProducts: data.outofStockProducts || 0,
      } as ProductStats;
    },
  });

  // Fetch warehouses for dropdown
  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await api.get('/warehouses');
      return response.data.data as Warehouse[];
    },
  });

  // Add product mutation
  const addMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await api.post('/products', data);
    },
    onSuccess: () => {
      toast.success('Product created successfully');
      setShowAddModal(false);
      resetAdd();
      refetch();
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  // Edit product mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EditProductFormData }) => {
      await api.put(`/products/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      setShowEditModal(false);
      setSelectedProduct(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['product-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });

  // Add product form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    reset: resetAdd,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const onSubmitAdd = (data: ProductFormData) => {
    addMutation.mutate(data);
  };

  // Edit product form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    setValue: setEditValue,
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  });

  const onSubmitEdit = (data: EditProductFormData) => {
    if (selectedProduct) {
      editMutation.mutate({ id: selectedProduct.id, data });
    }
  };

  // Load product data into edit form when modal opens
  useEffect(() => {
    if (showEditModal && selectedProduct) {
      setEditValue('productCode', selectedProduct.productCode);
      setEditValue('productName', selectedProduct.productName);
      setEditValue('category', selectedProduct.category);
      setEditValue('purchasePrice', selectedProduct.purchasePrice);
      setEditValue('sellingPrice', selectedProduct.sellingPrice);
      setEditValue('gstPercentage', selectedProduct.gstPercentage);
      setEditValue('stockQuantity', selectedProduct.stockQuantity);
      setEditValue('minimumStock', selectedProduct.minimumStock);
      setEditValue('description', selectedProduct.description || '');
      setEditValue('status', selectedProduct.status as 'ACTIVE' | 'INACTIVE');
      setEditValue('warehouseId', selectedProduct.warehouseId);
    }
  }, [showEditModal, selectedProduct, setEditValue]);

  // Helper functions
  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return 'OUT OF STOCK';
    if (product.stockQuantity <= product.minimumStock) return 'LOW STOCK';
    return 'IN STOCK';
  };

  const getStockStatusColor = (product: Product) => {
    const status = getStockStatus(product);
    if (status === 'OUT OF STOCK') return 'bg-red-100 text-red-800';
    if (status === 'LOW STOCK') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id);
    }
  };

  const exportToCSV = () => {
    if (!productsData?.products) return;

    const headers = ['Product Code', 'Product Name', 'Category', 'Purchase Price', 'Selling Price', 'GST %', 'Stock', 'Min Stock', 'Status', 'Warehouse'];
    const csvContent = [
      headers.join(','),
      ...productsData.products.map(product => [
        product.productCode,
        product.productName,
        product.category,
        product.purchasePrice,
        product.sellingPrice,
        product.gstPercentage,
        product.stockQuantity,
        product.minimumStock,
        product.status,
        product.warehouseId,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil((productsData?.total || 0) / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, productsData?.total || 0);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage products, pricing, inventory and stock levels</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Active Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeProducts || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.lowStockProducts || 0}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{stats?.outofStockProducts || 0}</p>
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
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none w-full sm:w-64"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                >
                  <option value="">All Categories</option>
                  {Array.from(new Set(productsData?.products?.map(p => p.category))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                {/* Warehouse Filter */}
                <select
                  value={warehouseId}
                  onChange={(e) => {
                    setWarehouseId(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                >
                  <option value="">All Warehouses</option>
                  {warehouses?.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name}</option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(search || category || status || warehouseId) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setStatus('');
                      setWarehouseId('');
                      setPage(1);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-[#1a1a2e] text-white px-4 py-2 rounded-lg hover:bg-[#16213e] transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a1a2e]"></div>
              </div>
            ) : !productsData?.products || productsData.products.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 mb-4">
                  {search || category || status || warehouseId
                    ? 'No products match your search criteria.'
                    : 'No products found.'}
                </p>
                <p className="text-gray-500 mb-4">
                  {search || category || status || warehouseId
                    ? 'Try adjusting your filters.'
                    : 'Start by adding your first product.'}
                </p>
                {(search || category || status || warehouseId) && (
                  <button
                    onClick={() => {
                      setSearch('');
                      setCategory('');
                      setStatus('');
                      setWarehouseId('');
                      setPage(1);
                    }}
                    className="text-[#1a1a2e] hover:text-[#16213e] font-medium"
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productsData.products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.productCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.purchasePrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.sellingPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product)}`}>
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {warehouses?.find(w => w.id === product.warehouseId)?.name || product.warehouseId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowViewModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowEditModal(true);
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {role === 'ADMIN' && (
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {productsData?.products && productsData.products.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex} to {endIndex} of {productsData.total} entries
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`px-3 py-1 border rounded ${page === p ? 'bg-[#1a1a2e] text-white' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Product</h2>
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
                    Product Code *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('productCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="PRD001"
                  />
                  {addErrors.productCode && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.productCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('productName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Product Name"
                  />
                  {addErrors.productName && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.productName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    {...registerAdd('category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Electronics"
                  />
                  {addErrors.category && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.category.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse *
                  </label>
                  <select
                    {...registerAdd('warehouseId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses?.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                  {addErrors.warehouseId && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.warehouseId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerAdd('purchasePrice', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                  {addErrors.purchasePrice && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.purchasePrice.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerAdd('sellingPrice', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="0.00"
                  />
                  {addErrors.sellingPrice && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.sellingPrice.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Percentage
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerAdd('gstPercentage', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="18"
                  />
                  {addErrors.gstPercentage && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.gstPercentage.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    {...registerAdd('stockQuantity', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="0"
                  />
                  {addErrors.stockQuantity && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.stockQuantity.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    {...registerAdd('minimumStock', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="10"
                  />
                  {addErrors.minimumStock && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.minimumStock.message}</p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerAdd('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="Product description..."
                  />
                  {addErrors.description && (
                    <p className="text-sm text-red-600 mt-1">{addErrors.description.message}</p>
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
                  {addMutation.isPending ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
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
                    Product Code *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('productCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="PRD001"
                  />
                  {editErrors.productCode && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.productCode.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('productName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Product Name"
                  />
                  {editErrors.productName && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.productName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    {...registerEdit('category')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="Electronics"
                  />
                  {editErrors.category && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.category.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse *
                  </label>
                  <select
                    {...registerEdit('warehouseId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="">Select warehouse</option>
                    {warehouses?.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                    ))}
                  </select>
                  {editErrors.warehouseId && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.warehouseId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    readOnly={role === 'WAREHOUSE'}
                    {...registerEdit('purchasePrice', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none read-only:bg-gray-100 read-only:text-gray-500"
                    placeholder="0.00"
                  />
                  {editErrors.purchasePrice && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.purchasePrice.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selling Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    readOnly={role === 'WAREHOUSE'}
                    {...registerEdit('sellingPrice', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none read-only:bg-gray-100 read-only:text-gray-500"
                    placeholder="0.00"
                  />
                  {editErrors.sellingPrice && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.sellingPrice.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Percentage
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...registerEdit('gstPercentage', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="18"
                  />
                  {editErrors.gstPercentage && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.gstPercentage.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    {...registerEdit('stockQuantity', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="0"
                  />
                  {editErrors.stockQuantity && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.stockQuantity.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    {...registerEdit('minimumStock', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                    placeholder="10"
                  />
                  {editErrors.minimumStock && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.minimumStock.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    {...registerEdit('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {editErrors.status && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.status.message}</p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...registerEdit('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a2e] focus:border-transparent outline-none resize-none"
                    placeholder="Product description..."
                  />
                  {editErrors.description && (
                    <p className="text-sm text-red-600 mt-1">{editErrors.description.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedProduct(null);
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
                  {editMutation.isPending ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedProduct(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product Code</p>
                  <p className="font-medium text-gray-900">{selectedProduct.productCode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Product Name</p>
                  <p className="font-medium text-gray-900">{selectedProduct.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-medium text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Warehouse</p>
                  <p className="font-medium text-gray-900">
                    {warehouses?.find(w => w.id === selectedProduct.warehouseId)?.name || selectedProduct.warehouseId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Purchase Price</p>
                  <p className="font-medium text-gray-900">₹{selectedProduct.purchasePrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                  <p className="font-medium text-gray-900">₹{selectedProduct.sellingPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">GST Percentage</p>
                  <p className="font-medium text-gray-900">{selectedProduct.gstPercentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Quantity</p>
                  <p className="font-medium text-gray-900">{selectedProduct.stockQuantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Minimum Stock</p>
                  <p className="font-medium text-gray-900">{selectedProduct.minimumStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(selectedProduct)}`}>
                    {getStockStatus(selectedProduct)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProduct.status)}`}>
                    {selectedProduct.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedProduct.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="font-medium text-gray-900">{selectedProduct.description || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Delete Product</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete product <strong>{selectedProduct.productName}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedProduct(null);
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
