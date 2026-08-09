import { prisma } from "../lib/prisma.js";
import type { ProductResponse } from "../interfaces/product.interface.js";

export class ProductRepository {
  async create(data: any): Promise<ProductResponse> {
    const product = await prisma.product.create({
      data,
    });

    return this.formatResponse(product);
  }

  async findById(id: string): Promise<ProductResponse | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    return product ? this.formatResponse(product) : null;
  }

  async findByProductCode(productCode: string): Promise<ProductResponse | null> {
    const product = await prisma.product.findUnique({
      where: { productCode },
    });

    return product ? this.formatResponse(product) : null;
  }

  async findAll(
    search?: string,
    category?: string,
    status?: string,
    warehouseId?: string,
    page: number = 1,
    limit: number = 10,
    inventoryStatus?: string
  ): Promise<{ products: ProductResponse[]; total: number }> {
    const where: any = {};

    if (search) {
      where.OR = [
        { productCode: { contains: search, mode: 'insensitive' } },
        { productName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (inventoryStatus) {
      if (inventoryStatus === "OUT_OF_STOCK") {
        where.stockQuantity = 0;
      } else if (inventoryStatus === "LOW_STOCK") {
        where.stockQuantity = {
          gt: 0,
          lte: prisma.product.fields.minimumStock,
        };
      } else if (inventoryStatus === "HEALTHY") {
        where.stockQuantity = {
          gt: prisma.product.fields.minimumStock,
        };
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((product) => this.formatResponse(product)),
      total,
    };
  }

  async update(id: string, data: any): Promise<ProductResponse> {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return this.formatResponse(product);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  async warehouseExists(warehouseId: string): Promise<boolean> {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });

    return !!warehouse;
  }

  private formatResponse(product: any): ProductResponse {
    let inventoryStatus: "HEALTHY" | "LOW_STOCK" | "OUT_OF_STOCK" = "HEALTHY";
    if (product.stockQuantity === 0) {
      inventoryStatus = "OUT_OF_STOCK";
    } else if (product.stockQuantity <= product.minimumStock) {
      inventoryStatus = "LOW_STOCK";
    }

    return {
      id: product.id,
      productCode: product.productCode,
      productName: product.productName,
      category: product.category,
      purchasePrice: Number(product.purchasePrice),
      sellingPrice: Number(product.sellingPrice),
      gstPercentage: product.gstPercentage,
      stockQuantity: product.stockQuantity,
      minimumStock: product.minimumStock,
      description: product.description,
      status: product.status,
      inventoryStatus,
      warehouseId: product.warehouseId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
