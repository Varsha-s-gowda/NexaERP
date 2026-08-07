import { prisma } from "../lib/prisma.js";
import type {
  LowStockProductResponse,
  SalesSummaryResponse,
} from "../interfaces/dashboard.interface.js";

export class DashboardRepository {
  async getTotalCustomers(): Promise<number> {
    return await prisma.customer.count();
  }

  async getActiveCustomers(): Promise<number> {
    return await prisma.customer.count({
      where: { status: "ACTIVE" },
    });
  }

  async getTotalProducts(): Promise<number> {
    return await prisma.product.count();
  }

  async getLowStockProducts(): Promise<LowStockProductResponse[]> {
    const products = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: prisma.product.fields.minimumStock,
        },
      },
      select: {
        id: true,
        productCode: true,
        productName: true,
        category: true,
        stockQuantity: true,
        minimumStock: true,
        warehouseId: true,
      },
    });

    return products.map((product) => ({
      id: product.id,
      productCode: product.productCode,
      productName: product.productName,
      category: product.category,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock,
      warehouseId: product.warehouseId,
    }));
  }

  async getTotalWarehouses(): Promise<number> {
    return await prisma.warehouse.count();
  }

  async getTotalSalesChallans(): Promise<number> {
    return await prisma.salesChallan.count();
  }

  async getConfirmedSales(): Promise<number> {
    return await prisma.salesChallan.count({
      where: { status: "CONFIRMED" },
    });
  }

  async getCancelledSales(): Promise<number> {
    return await prisma.salesChallan.count({
      where: { status: "CANCELLED" },
    });
  }

  async getTotalSalesAmount(): Promise<number> {
    const result = await prisma.salesChallan.aggregate({
      where: { status: "CONFIRMED" },
      _sum: {
        totalAmount: true,
      },
    });

    return Number(result._sum.totalAmount || 0);
  }

  async getTodaySales(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.salesChallan.aggregate({
      where: {
        status: "CONFIRMED",
        createdAt: {
          gte: today,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return Number(result._sum.totalAmount || 0);
  }

  async getMonthlySales(): Promise<SalesSummaryResponse[]> {
    const sales = await prisma.salesChallan.groupBy({
      by: ["createdAt"],
      where: { status: "CONFIRMED" },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const monthlyData = new Map<string, SalesSummaryResponse>();

    for (const sale of sales) {
      const date = new Date(sale.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(monthKey);
      if (existing) {
        existing.totalSales += sale._count.id;
        existing.totalRevenue += Number(sale._sum.totalAmount || 0);
      } else {
        monthlyData.set(monthKey, {
          month: monthKey,
          totalSales: sale._count.id,
          totalRevenue: Number(sale._sum.totalAmount || 0),
        });
      }
    }

    return Array.from(monthlyData.values());
  }
}
