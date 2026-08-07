export interface CreateWarehouseRequest {
  name: string;
  location: string;
  isActive?: boolean;
}

export interface UpdateWarehouseRequest {
  name?: string;
  location?: string;
  isActive?: boolean;
}

export interface WarehouseResponse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
