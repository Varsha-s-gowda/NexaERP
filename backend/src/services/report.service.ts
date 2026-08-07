import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import type { ReportRepository } from "../repositories/report.repository.js";
import type {
  SalesReportResponse,
  InventoryReportResponse,
  CustomerReportResponse,
  ProductReportResponse,
  TopSellingProductResponse,
} from "../interfaces/report.interface.js";
import { Role } from "@prisma/client";

export class ReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async getSalesReport(filters: {
    startDate?: string;
    endDate?: string;
    customerId?: string;
    status?: string;
  }, userRole: Role): Promise<SalesReportResponse[]> {
    if (userRole === Role.WAREHOUSE) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    const queryFilters: any = {};

    if (filters.startDate) {
      queryFilters.startDate = new Date(filters.startDate);
    }

    if (filters.endDate) {
      queryFilters.endDate = new Date(filters.endDate);
      queryFilters.endDate.setHours(23, 59, 59, 999);
    }

    if (filters.customerId) {
      queryFilters.customerId = filters.customerId;
    }

    if (filters.status) {
      queryFilters.status = filters.status;
    }

    return await this.reportRepository.getSalesReport(queryFilters);
  }

  async getInventoryReport(userRole: Role): Promise<InventoryReportResponse[]> {
    if (userRole === Role.SALES || userRole === Role.ACCOUNTS) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }
    return await this.reportRepository.getInventoryReport();
  }

  async getCustomerReport(userRole: Role): Promise<CustomerReportResponse[]> {
    if (userRole === Role.WAREHOUSE || userRole === Role.ACCOUNTS) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }
    return await this.reportRepository.getCustomerReport();
  }

  async getProductReport(userRole: Role): Promise<ProductReportResponse[]> {
    if (userRole === Role.SALES || userRole === Role.ACCOUNTS) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }
    return await this.reportRepository.getProductReport();
  }

  async getTopSellingProducts(limit?: number, userRole?: Role): Promise<TopSellingProductResponse[]> {
    if (userRole === Role.SALES || userRole === Role.ACCOUNTS) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }
    const topN = limit ? parseInt(limit.toString()) : 10;
    return await this.reportRepository.getTopSellingProducts(topN);
  }
}
