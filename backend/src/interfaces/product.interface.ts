export interface CreateProductRequest {
  productCode: string;
  productName: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercentage?: number;
  stockQuantity?: number;
  minimumStock?: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  warehouseId: string;
}

export interface UpdateProductRequest {
  productCode?: string;
  productName?: string;
  category?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  gstPercentage?: number;
  stockQuantity?: number;
  minimumStock?: number;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  warehouseId?: string;
}

export interface ProductResponse {
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
