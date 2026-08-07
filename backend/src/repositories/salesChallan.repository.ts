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
      },
    });

    return this.formatResponse(challan);
  }

  async findById(id: string): Promise<SalesChallanResponse | null> {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    return challan ? this.formatResponse(challan) : null;
  }

  async findAll(createdBy?: string): Promise<SalesChallanResponse[]> {
    const where = createdBy ? { createdBy } : {};
    const challans = await prisma.salesChallan.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return challans.map((challan) => this.formatResponse(challan));
  }

  async updateStatus(id: string, status: string): Promise<SalesChallanResponse> {
    const challan = await prisma.salesChallan.update({
      where: { id },
      data: { status: status as any },
      include: {
        items: true,
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

  private formatResponse(challan: any): SalesChallanResponse {
    return {
      id: challan.id,
      challanNumber: challan.challanNumber,
      customerId: challan.customerId,
      totalQuantity: challan.totalQuantity,
      totalAmount: Number(challan.totalAmount),
      status: challan.status,
      createdBy: challan.createdBy,
      items: challan.items.map((item: any) => this.formatItemResponse(item)),
      createdAt: challan.createdAt.toISOString(),
      updatedAt: challan.updatedAt.toISOString(),
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
