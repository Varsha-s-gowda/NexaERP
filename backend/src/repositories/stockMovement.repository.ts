import { prisma } from "../lib/prisma.js";
import type { StockMovementResponse } from "../interfaces/stockMovement.interface.js";

export class StockMovementRepository {
  async create(data: any, createdBy: string): Promise<StockMovementResponse> {
    const stockMovement = await prisma.stockMovement.create({
      data: {
        ...data,
        createdBy,
      },
    });

    return this.formatResponse(stockMovement);
  }

  async findById(id: string): Promise<StockMovementResponse | null> {
    const stockMovement = await prisma.stockMovement.findUnique({
      where: { id },
    });

    return stockMovement ? this.formatResponse(stockMovement) : null;
  }

  async findAll(): Promise<StockMovementResponse[]> {
    const stockMovements = await prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return stockMovements.map((movement) => this.formatResponse(movement));
  }

  async findByProduct(productId: string): Promise<StockMovementResponse[]> {
    const stockMovements = await prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });

    return stockMovements.map((movement) => this.formatResponse(movement));
  }

  async updateProductStock(
    productId: string,
    quantity: number,
    movementType: "IN" | "OUT"
  ): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const currentStock = product.stockQuantity;
    let newStock: number;

    if (movementType === "IN") {
      newStock = currentStock + quantity;
    } else {
      newStock = currentStock - quantity;
      if (newStock < 0) {
        throw new Error("Insufficient stock");
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: newStock },
    });
  }

  async productExists(productId: string): Promise<boolean> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    return !!product;
  }

  async getProductStock(productId: string): Promise<number> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true },
    });

    return product?.stockQuantity ?? 0;
  }

  private formatResponse(movement: any): StockMovementResponse {
    return {
      id: movement.id,
      productId: movement.productId,
      quantity: movement.quantity,
      movementType: movement.movementType,
      reason: movement.reason,
      createdBy: movement.createdBy,
      createdAt: movement.createdAt.toISOString(),
      updatedAt: movement.updatedAt.toISOString(),
    };
  }
}
