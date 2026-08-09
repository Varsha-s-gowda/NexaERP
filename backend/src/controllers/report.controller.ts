import type { Request, Response, NextFunction } from "express";

import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type { ReportService } from "../services/report.service.js";

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  async salesReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, customerId, status, paymentStatus } = req.query;
      const userRole = (req as any).user?.role;

      const result = await this.reportService.getSalesReport({
        startDate: startDate as string,
        endDate: endDate as string,
        customerId: customerId as string,
        status: status as string,
        paymentStatus: paymentStatus as string,
      }, userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Sales report retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async inventoryReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.reportService.getInventoryReport(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Inventory report retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async customerReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.reportService.getCustomerReport(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Customer report retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async productReport(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userRole = (req as any).user?.role;
      const result = await this.reportService.getProductReport(userRole);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Product report retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async topSellingProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit } = req.query;
      const userRole = (req as any).user?.role;

      const result = await this.reportService.getTopSellingProducts(
        limit ? parseInt(limit as string) : undefined,
        userRole
      );

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Top selling products retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
