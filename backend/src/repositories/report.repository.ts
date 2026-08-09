import { prisma } from "../lib/prisma.js";
import type {
  SalesReportResponse,
  InventoryReportResponse,
  CustomerReportResponse,
  ProductReportResponse,
  TopSellingProductResponse,
} from "../interfaces/report.interface.js";

export class ReportRepository {
  async getSalesReport(filters: {
    startDate?: Date;
    endDate?: Date;
    customerId?: string;
    status?: string;
    paymentStatus?: string;
  }): Promise<SalesReportResponse[]> {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    const challans = await prisma.salesChallan.findMany({
      where,
      include: {
        customer: {
          select: {
            customerName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return challans.map((challan) => {
      const totalAmount = Number(challan.totalAmount);
      const amountPaid = Number(challan.amountPaid || 0);
      const outstandingAmount = Math.max(0, totalAmount - amountPaid);

      return {
        id: challan.id,
        challanNumber: challan.challanNumber,
        customerId: challan.customerId,
        customerName: challan.customer.customerName,
        totalQuantity: challan.totalQuantity,
        totalAmount,
        amountPaid,
        outstandingAmount,
        paymentStatus: challan.paymentStatus || "PENDING",
        status: challan.status,
        createdAt: challan.createdAt.toISOString(),
      };
    });
  }

  async getInventoryReport(): Promise<InventoryReportResponse[]> {
    const products = await prisma.product.findMany({
      include: {
        warehouse: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { stockQuantity: "asc" },
    });

    return products.map((product) => ({
      id: product.id,
      productCode: product.productCode,
      productName: product.productName,
      category: product.category,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock,
      warehouseId: product.warehouseId,
      warehouseName: product.warehouse.name,
      purchasePrice: Number(product.purchasePrice),
      sellingPrice: Number(product.sellingPrice),
      totalValue: Number(product.purchasePrice) * product.stockQuantity,
    }));
  }

  async getCustomerReport(): Promise<CustomerReportResponse[]> {
    const customers = await prisma.customer.findMany({
      include: {
        challans: true,
      },
      orderBy: { customerName: "asc" },
    });

    return customers.map((customer: any) => {
      const confirmedChallans = customer.challans.filter(
        (challan: any) => challan.status === "CONFIRMED"
      );
      const totalChallans = confirmedChallans.length;
      const totalRevenue = confirmedChallans.reduce(
        (sum: number, challan: any) => sum + Number(challan.totalAmount),
        0
      );
      const lastPurchaseDate =
        confirmedChallans.length > 0
          ? confirmedChallans[confirmedChallans.length - 1].createdAt.toISOString()
          : null;

      return {
        id: customer.id,
        customerName: customer.customerName,
        businessName: customer.businessName,
        customerCode: customer.customerCode,
        status: customer.status,
        totalChallans,
        totalRevenue,
        lastPurchaseDate,
      };
    });
  }

  async getProductReport(): Promise<ProductReportResponse[]> {
    const products = await prisma.product.findMany({
      include: {
        challanItems: {
          include: {
            challan: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    return products.map((product: any) => {
      const confirmedItems = product.challanItems.filter(
        (item: any) => item.challan.status === "CONFIRMED"
      );

      const salesCount = confirmedItems.length;
      const totalQuantitySold = confirmedItems.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      const totalRevenue = confirmedItems.reduce(
        (sum: number, item: any) => sum + Number(item.totalPrice),
        0
      );

      return {
        id: product.id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.category,
        salesCount,
        totalQuantitySold,
        totalRevenue,
        currentStock: product.stockQuantity,
        warehouseId: product.warehouseId,
      };
    });
  }

  async getTopSellingProducts(limit: number = 10): Promise<TopSellingProductResponse[]> {
    const products = await prisma.product.findMany({
      include: {
        challanItems: {
          include: {
            challan: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    const productStats = products.map((product: any) => {
      const confirmedItems = product.challanItems.filter(
        (item: any) => item.challan.status === "CONFIRMED"
      );

      const totalQuantitySold = confirmedItems.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      const totalRevenue = confirmedItems.reduce(
        (sum: number, item: any) => sum + Number(item.totalPrice),
        0
      );
      const salesCount = confirmedItems.length;

      return {
        productId: product.id,
        productCode: product.productCode,
        productName: product.productName,
        category: product.category,
        totalQuantitySold,
        totalRevenue,
        salesCount,
      };
    });

    return productStats
      .sort((a: any, b: any) => b.totalQuantitySold - a.totalQuantitySold)
      .slice(0, limit);
  }

  async getLowStockReport(): Promise<InventoryReportResponse[]> {
    const products = await prisma.product.findMany({
      where: {
        stockQuantity: {
          lte: prisma.product.fields.minimumStock,
        },
      },
      include: {
        warehouse: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { stockQuantity: "asc" },
    });

    return products.map((product) => ({
      id: product.id,
      productCode: product.productCode,
      productName: product.productName,
      category: product.category,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock,
      warehouseId: product.warehouseId,
      warehouseName: product.warehouse.name,
      purchasePrice: Number(product.purchasePrice),
      sellingPrice: Number(product.sellingPrice),
      totalValue: Number(product.purchasePrice) * product.stockQuantity,
    }));
  }
}
