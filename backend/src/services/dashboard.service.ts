import type { DashboardRepository } from "../repositories/dashboard.repository.js";
import type {
  DashboardSummaryResponse,
  LowStockProductResponse,
  SalesSummaryResponse,
} from "../interfaces/dashboard.interface.js";
import { Role } from "@prisma/client";

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async getSummary(userRole: Role): Promise<DashboardSummaryResponse> {
    const [
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts,
      totalWarehouses,
      totalSales,
      confirmedSales,
      cancelledSales,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      this.dashboardRepository.getTotalCustomers(),
      this.dashboardRepository.getActiveCustomers(),
      this.dashboardRepository.getTotalProducts(),
      this.dashboardRepository.getLowStockProducts(),
      this.dashboardRepository.getTotalWarehouses(),
      this.dashboardRepository.getTotalSalesChallans(),
      this.dashboardRepository.getConfirmedSales(),
      this.dashboardRepository.getCancelledSales(),
      this.dashboardRepository.getTotalSalesAmount(),
      this.dashboardRepository.getTodaySales(),
    ]);

    const summary: DashboardSummaryResponse = {
      totalCustomers: 0,
      activeCustomers: 0,
      totalProducts: 0,
      lowStockProducts: 0,
      totalWarehouses: 0,
      totalSales: 0,
      confirmedSales: 0,
      cancelledSales: 0,
      totalRevenue: 0,
      todayRevenue: 0,
    };

    if (userRole === Role.ADMIN) {
      Object.assign(summary, {
        totalCustomers,
        activeCustomers,
        totalProducts,
        lowStockProducts: lowStockProducts.length,
        totalWarehouses,
        totalSales,
        confirmedSales,
        cancelledSales,
        totalRevenue,
        todayRevenue,
      });
    } else if (userRole === Role.SALES) {
      Object.assign(summary, {
        totalCustomers,
        activeCustomers,
        totalSales,
        confirmedSales,
        cancelledSales,
        totalRevenue,
        todayRevenue,
      });
    } else if (userRole === Role.WAREHOUSE) {
      Object.assign(summary, {
        totalProducts,
        lowStockProducts: lowStockProducts.length,
        totalWarehouses,
      });
    } else if (userRole === Role.ACCOUNTS) {
      Object.assign(summary, {
        totalSales,
        confirmedSales,
        cancelledSales,
        totalRevenue,
        todayRevenue,
      });
    }

    return summary;
  }

  async getLowStock(userRole: Role): Promise<LowStockProductResponse[]> {
    if (userRole === Role.SALES || userRole === Role.ACCOUNTS) {
      return [];
    }
    return await this.dashboardRepository.getLowStockProducts();
  }

  async getMonthlySales(userRole: Role): Promise<SalesSummaryResponse[]> {
    if (userRole === Role.WAREHOUSE) {
      return [];
    }
    return await this.dashboardRepository.getMonthlySales();
  }
}
