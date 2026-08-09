import { prisma } from "../lib/prisma.js";
import type { SalesChallanResponse, SalesChallanItemResponse } from "../interfaces/salesChallan.interface.js";

export class SalesChallanRepository {
  async create(data: any, createdBy: string): Promise<SalesChallanResponse> {
    const challan = await prisma.salesChallan.create({
      data: {
        ...data,
        createdBy,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    return this.formatResponse(challan);
  }

  async findById(id: string): Promise<SalesChallanResponse | null> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    });

    return challan ? this.formatResponse(challan) : null;
  }

  async findAll(createdBy?: string, page: number = 1, limit: number = 10, search?: string, status?: string, customerId?: string, startDate?: string, endDate?: string): Promise<{ challans: SalesChallanResponse[], total: number }> {
    const where: any = createdBy ? { createdBy } : {};
    
    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: 'insensitive' } },
        { customer: { customerName: { contains: search, mode: 'insensitive' } } },
        { customer: { businessName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }
    
    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        include: {
          items: true,
          customer: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return {
      challans: challans.map((challan) => this.formatResponse(challan)),
      total,
    };
  }

  async updateStatus(id: string, status: string): Promise<SalesChallanResponse> {
    const challan = await prisma.salesChallan.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: true,
        customer: true,
      },
    });

    return this.formatResponse(challan);
  }

  async findLatestChallanNumber(): Promise<string | null> {
    const latestChallan = await prisma.salesChallan.findFirst({
      orderBy: { challanNumber: "desc" },
      select: { challanNumber: true },
    });

    return latestChallan?.challanNumber ?? null;
  }

  async customerExists(customerId: string): Promise<boolean> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    return !!customer;
  }

  async productExists(productId: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    return !!product;
  }

  async getProduct(productId: string): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    return product;
  }

  formatResponse(challan: any): SalesChallanResponse {
    const totalAmount = Number(challan.totalAmount);
    const amountPaid = Number(challan.amountPaid || 0);
    const outstandingAmount = Math.max(0, totalAmount - amountPaid);

    return {
      id: challan.id,
      challanNumber: challan.challanNumber,
      customerId: challan.customerId,
      totalQuantity: challan.totalQuantity,
      totalAmount,
      amountPaid,
      outstandingAmount,
      paymentStatus: challan.paymentStatus || "PENDING",
      status: challan.status,
      createdBy: challan.createdBy,
      items: challan.items.map((item: any) => this.formatItemResponse(item)),
      createdAt: challan.createdAt.toISOString(),
      updatedAt: challan.updatedAt.toISOString(),
      customerName: challan.customer?.customerName || '',
      businessName: challan.customer?.businessName || '',
    };
  }

  private formatItemResponse(item: any): SalesChallanItemResponse {
    return {
      id: item.id,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      sellingPrice: Number(item.sellingPrice),
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
