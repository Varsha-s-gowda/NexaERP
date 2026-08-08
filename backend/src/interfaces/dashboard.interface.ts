export interface DashboardSummaryResponse {
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
