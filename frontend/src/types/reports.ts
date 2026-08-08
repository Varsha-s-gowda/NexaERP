export interface SalesReportResponse {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface InventoryReportResponse {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  stockQuantity: number;
  minimumStock: number;
  warehouseId: string;
  warehouseName: string;
  purchasePrice: number;
  sellingPrice: number;
  totalValue: number;
}

export interface CustomerReportResponse {
  id: string;
  customerName: string;
  businessName: string;
  customerCode: string;
  status: string;
  totalChallans: number;
  totalRevenue: number;
  lastPurchaseDate: string | null;
}

export interface ProductReportResponse {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  salesCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
  currentStock: number;
  warehouseId: string;
}

export interface TopSellingProductResponse {
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  salesCount: number;
}

/* -----------------------------
   Report Filters
----------------------------- */

export type ReportType =
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'products'
  | 'top-selling';

export type DateRange =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export interface ReportFilters {
  reportType: ReportType;
  dateRange: DateRange;
  warehouseId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}

/* -----------------------------
   Sales Report Summary
----------------------------- */

export interface SalesReportSummary {
  totalSales: number;
  totalRevenue: number;
  productsSold: number;
  stockMovements: number;
}

/* -----------------------------
   Sales Chart
----------------------------- */

export interface SalesChartData {
  date: string;
  salesCount: number;
  revenue: number;
}

/* -----------------------------
   Pagination
----------------------------- */

export interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* -----------------------------
   Generic Paginated Response
----------------------------- */

export interface PaginatedReportResponse<T> {
  data: T[];
  pagination: ReportPagination;
}

/* -----------------------------
   Report API Response
----------------------------- */

export interface ReportsDashboardResponse {
  summary: SalesReportSummary;
  sales: SalesReportResponse[];
  chart: SalesChartData[];
  pagination: ReportPagination;
}