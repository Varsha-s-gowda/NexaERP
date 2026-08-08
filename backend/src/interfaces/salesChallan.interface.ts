export interface SalesChallanItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateSalesChallanRequest {
  customerId: string;
  items: SalesChallanItemRequest[];
}

export interface UpdateSalesChallanStatusRequest {
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
}

export interface SalesChallanItemResponse {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  sellingPrice: number;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesChallanResponse {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  status: string;
  createdBy: string;
  items: SalesChallanItemResponse[];
  createdAt: string;
  updatedAt: string;
  customerName: string;
  businessName: string;
}
