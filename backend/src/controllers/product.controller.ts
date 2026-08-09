import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type {
  CreateProductRequest,
  UpdateProductRequest,
} from "../interfaces/product.interface.js";
import type { ProductService } from "../services/product.service.js";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: CreateProductRequest = req.body;

      const result = await this.productService.create(data);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Product created successfully",
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
          "Product ID is required"
        );
      }

      const result = await this.productService.getById(id as string);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Product retrieved successfully",
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
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;
      const warehouseId = req.query.warehouseId as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const inventoryStatus = req.query.inventoryStatus as string | undefined;

      const result = await this.productService.getAll(search, category, status, warehouseId, page, limit, inventoryStatus);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Products retrieved successfully",
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
          "Product ID is required"
        );
      }

      const data: UpdateProductRequest = req.body;
      const userRole = (req as any).user?.role;

      const result = await this.productService.update(id as string, data, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Product updated successfully",
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
          "Product ID is required"
        );
      }

      await this.productService.delete(id as string, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Product deleted successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
