export interface DashboardSummary {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalWarehouses: number;
  totalSales: number;
  confirmedSales: number;
  cancelledSales: number;
  totalRevenue: number;
  todayRevenue: number;
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
