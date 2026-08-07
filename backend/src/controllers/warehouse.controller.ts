import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type {
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from "../interfaces/warehouse.interface.js";
import type { WarehouseService } from "../services/warehouse.service.js";

export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: CreateWarehouseRequest = req.body;
      const userRole = (req as any).user?.role;

      const result = await this.warehouseService.create(data, userRole);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Warehouse created successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Warehouse ID is required"
        );
      }

      const result = await this.warehouseService.getById(id as string, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Warehouse retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.warehouseService.getAll(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Warehouses retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Warehouse ID is required"
        );
      }

      const data: UpdateWarehouseRequest = req.body;
      const userRole = (req as any).user?.role;

      const result = await this.warehouseService.update(id as string, data, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Warehouse updated successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Warehouse ID is required"
        );
      }

      await this.warehouseService.delete(id as string, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Warehouse deleted successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
