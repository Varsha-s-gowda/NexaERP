import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../interfaces/customer.interface.js";
import type { CustomerService } from "../services/customer.service.js";

export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: CreateCustomerRequest = req.body;
      const createdBy = (req as any).user?.userId;

      if (!createdBy) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "User authentication required"
        );
      }

      const result = await this.customerService.create(data, createdBy);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Customer created successfully",
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
          "Customer ID is required"
        );
      }

      const result = await this.customerService.getById(id as string, userId, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Customer retrieved successfully",
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
      const result = await this.customerService.getAll(userId, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Customers retrieved successfully",
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
          "Customer ID is required"
        );
      }

      const data: UpdateCustomerRequest = req.body;
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      const result = await this.customerService.update(
        id as string,
        data,
        userId,
        userRole
      );

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Customer updated successfully",
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
          "Customer ID is required"
        );
      }

      await this.customerService.delete(id as string, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Customer deleted successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}