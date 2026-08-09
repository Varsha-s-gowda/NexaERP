export interface SalesReportResponse {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  totalQuantity: number;
  totalAmount: number;
  amountPaid: number;
  outstandingAmount: number;
  paymentStatus: string;
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
