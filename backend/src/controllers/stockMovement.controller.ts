import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type { CreateStockMovementRequest } from "../interfaces/stockMovement.interface.js";
import type { StockMovementService } from "../services/stockMovement.service.js";

export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: CreateStockMovementRequest = req.body;
      const createdBy = (req as any).user?.userId;

      if (!createdBy) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "User authentication required"
        );
      }

      const result = await this.stockMovementService.create(data, createdBy);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Stock movement created successfully",
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
      const result = await this.stockMovementService.getAll();

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Stock movements retrieved successfully",
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

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Stock movement ID is required"
        );
      }

      const result = await this.stockMovementService.getById(id as string);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Stock movement retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getByProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { productId } = req.params;

      if (!productId) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Product ID is required"
        );
      }

      const result = await this.stockMovementService.getByProduct(
        productId as string
      );

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Product stock movements retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
