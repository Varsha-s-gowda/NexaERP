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
      leadCustomers,
      inactiveCustomers,
      totalProducts,
      activeProducts,
      outofStockProducts,
      lowStockProducts,
      totalWarehouses,
      activeWarehouses,
      totalStockMovements,
      stockInMovements,
      stockOutMovements,
      transferMovements,
      totalSales,
      confirmedSales,
      cancelledSales,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      this.dashboardRepository.getTotalCustomers(),
      this.dashboardRepository.getActiveCustomers(),
      this.dashboardRepository.getLeadCustomers(),
      this.dashboardRepository.getInactiveCustomers(),
      this.dashboardRepository.getTotalProducts(),
      this.dashboardRepository.getActiveProducts(),
      this.dashboardRepository.getOutofStockProducts(),
      this.dashboardRepository.getLowStockProducts(),
      this.dashboardRepository.getTotalWarehouses(),
      this.dashboardRepository.getActiveWarehouses(),
      this.dashboardRepository.getTotalStockMovements(),
      this.dashboardRepository.getStockInMovements(),
      this.dashboardRepository.getStockOutMovements(),
      this.dashboardRepository.getTransferMovements(),
      this.dashboardRepository.getTotalSalesChallans(),
      this.dashboardRepository.getConfirmedSales(),
      this.dashboardRepository.getCancelledSales(),
      this.dashboardRepository.getTotalSalesAmount(),
      this.dashboardRepository.getTodaySales(),
    ]);

    const summary: DashboardSummaryResponse = {
      totalCustomers: 0,
      activeCustomers: 0,
      leadCustomers: 0,
      inactiveCustomers: 0,
      totalProducts: 0,
      activeProducts: 0,
      lowStockProducts: 0,
      outofStockProducts: 0,
      totalWarehouses: 0,
      activeWarehouses: 0,
      totalStockMovements: 0,
      stockInMovements: 0,
      stockOutMovements: 0,
      transferMovements: 0,
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
        leadCustomers,
        inactiveCustomers,
        totalProducts,
        activeProducts,
        lowStockProducts: lowStockProducts.length,
        outofStockProducts,
        totalWarehouses,
        activeWarehouses,
        totalStockMovements,
        stockInMovements,
        stockOutMovements,
        transferMovements,
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
        leadCustomers,
        inactiveCustomers,
        totalSales,
        confirmedSales,
        cancelledSales,
        totalRevenue,
        todayRevenue,
      });
    } else if (userRole === Role.WAREHOUSE) {
      Object.assign(summary, {
        totalProducts,
        activeProducts,
        lowStockProducts: lowStockProducts.length,
        outofStockProducts,
        totalWarehouses,
        activeWarehouses,
        totalStockMovements,
        stockInMovements,
        stockOutMovements,
        transferMovements,
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
