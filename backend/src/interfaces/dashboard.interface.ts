export interface DashboardSummaryResponse {
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

export interface LowStockProductResponse {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  stockQuantity: number;
  minimumStock: number;
  warehouseId: string;
}

export interface SalesSummaryResponse {
  month: string;
  totalSales: number;
  totalRevenue: number;
}

export interface CustomerSummaryResponse {
  id: string;
  customerName: string;
  businessName: string;
  status: string;
  totalChallans: number;
}
