export interface DashboardSummary {
  totalCustomers: number;
  activeCustomers: number;
  leadCustomers: number;
  inactiveCustomers: number;
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outofStockProducts: number;
  totalWarehouses: number;
  activeWarehouses: number;
  totalStockMovements: number;
  stockInMovements: number;
  stockOutMovements: number;
  transferMovements: number;
  totalSales: number;
  draftSales: number;
  confirmedSales: number;
  cancelledSales: number;
  totalRevenue: number;
  todayRevenue: number;
  totalCollected?: number;
  totalOutstanding?: number;
  pendingPaymentsCount?: number;
}

export interface LowStockProduct {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  stockQuantity: number;
  minimumStock: number;
  warehouseId: string;
}

export interface SalesSummary {
  month: string;
  totalSales: number;
  totalRevenue: number;
}

export interface SalesReport {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
