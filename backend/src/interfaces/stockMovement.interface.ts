export interface CreateStockMovementRequest {
  productId: string;
  quantity: number;
  movementType: "IN" | "OUT" | "TRANSFER";
  reason?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
}

export interface StockMovementResponse {
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
