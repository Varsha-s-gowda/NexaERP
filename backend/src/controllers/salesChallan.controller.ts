import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type {
  CreateSalesChallanRequest,
  UpdateSalesChallanStatusRequest,
} from "../interfaces/salesChallan.interface.js";
import type { SalesChallanService } from "../services/salesChallan.service.js";

export class SalesChallanController {
  constructor(private readonly salesChallanService: SalesChallanService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: CreateSalesChallanRequest = req.body;
      const createdBy = (req as any).user?.userId;

      if (!createdBy) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "User authentication required"
        );
      }

      const result = await this.salesChallanService.create(data, createdBy);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Sales challan created successfully",
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
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const result = await this.salesChallanService.getAll(userId, userRole, page, limit, search, status, customerId, startDate, endDate);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Sales challans retrieved successfully",
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
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Sales challan ID is required"
        );
      }

      const result = await this.salesChallanService.getById(id as string, userId, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Sales challan retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Sales challan ID is required"
        );
      }

      const data: UpdateSalesChallanStatusRequest = req.body;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const result = await this.salesChallanService.updateStatus(
        id as string,
        data,
        userId,
        userRole
      );

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Sales challan status updated successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
