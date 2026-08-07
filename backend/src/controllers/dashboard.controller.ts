import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type { DashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async summary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.dashboardService.getSummary(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Dashboard summary retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async lowStock(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.dashboardService.getLowStock(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Low stock products retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async monthlySales(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.dashboardService.getMonthlySales(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Monthly sales data retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
