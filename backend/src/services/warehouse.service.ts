import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import type { WarehouseRepository } from "../repositories/warehouse.repository.js";
import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  WarehouseResponse,
} from "../interfaces/warehouse.interface.js";
import { Role } from "@prisma/client";

export class WarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  async create(data: CreateWarehouseRequest, userRole: Role): Promise<WarehouseResponse> {
    if (userRole === Role.WAREHOUSE) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    const existingWarehouse = await this.warehouseRepository.findByName(
      data.name
    );

    if (existingWarehouse) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Warehouse name already exists"
      );
    }

    return await this.warehouseRepository.create(data);
  }

  async getById(id: string, userRole: Role): Promise<WarehouseResponse> {
    if (userRole === Role.WAREHOUSE) {
      const warehouse = await this.warehouseRepository.findById(id);
      if (!warehouse) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "Warehouse not found"
        );
      }
      return warehouse;
    }

    const warehouse = await this.warehouseRepository.findById(id);

    if (!warehouse) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Warehouse not found"
      );
    }

    return warehouse;
  }

  async getAll(userRole: Role): Promise<WarehouseResponse[]> {
    return await this.warehouseRepository.findAll();
  }

  async update(id: string, data: UpdateWarehouseRequest, userRole: Role): Promise<WarehouseResponse> {
    if (userRole === Role.WAREHOUSE) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    const warehouse = await this.warehouseRepository.findById(id);

    if (!warehouse) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Warehouse not found"
      );
    }

    if (data.name && data.name !== warehouse.name) {
      const existingWarehouse = await this.warehouseRepository.findByName(
        data.name
      );

      if (existingWarehouse) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Warehouse name already exists"
        );
      }
    }

    return await this.warehouseRepository.update(id, data);
  }

  async delete(id: string, userRole: Role): Promise<void> {
    if (userRole === Role.WAREHOUSE) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    const warehouse = await this.warehouseRepository.findById(id);

    if (!warehouse) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Warehouse not found"
      );
    }

    const hasProducts = await this.warehouseRepository.hasProducts(id);

    if (hasProducts) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Cannot delete warehouse with assigned products"
      );
    }

    await this.warehouseRepository.delete(id);
  }
}
