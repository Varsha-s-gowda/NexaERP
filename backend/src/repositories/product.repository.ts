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

  async findAll(): Promise<ProductResponse[]> {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => this.formatResponse(product));
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
      warehouseId: product.warehouseId,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
