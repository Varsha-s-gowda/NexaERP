export interface CreateStockMovementRequest {
  productId: string;
  quantity: number;
  movementType: "IN" | "OUT";
  reason: string;
}

export interface StockMovementResponse {
  id: string;
  productId: string;
  quantity: number;
  movementType: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
