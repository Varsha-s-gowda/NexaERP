import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../lib/prisma.js";

export class HealthController {
  async health(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check database connectivity
      await prisma.$queryRaw`SELECT 1`;

      const healthData = {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
        database: "connected",
      };

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Server is healthy",
          healthData
        )
      );
    } catch (error) {
      // Database connection failed
      res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
        success: false,
        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
        message: "Database unavailable",
      });
    }
  }
}
