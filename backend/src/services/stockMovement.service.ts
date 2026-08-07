import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { prisma } from "../lib/prisma.js";
import type { StockMovementRepository } from "../repositories/stockMovement.repository.js";
import type {
  CreateStockMovementRequest,
  StockMovementResponse,
} from "../interfaces/stockMovement.interface.js";

export class StockMovementService {
  constructor(private readonly stockMovementRepository: StockMovementRepository) {}

  async create(
    data: CreateStockMovementRequest,
    createdBy: string
  ): Promise<StockMovementResponse> {
    const productExists = await this.stockMovementRepository.productExists(
      data.productId
    );

    if (!productExists) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Product not found"
      );
    }

    if (data.movementType === "OUT") {
      const currentStock = await this.stockMovementRepository.getProductStock(
        data.productId
      );

      if (data.quantity > currentStock) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          `Insufficient stock. Available: ${currentStock}, Requested: ${data.quantity}`
        );
      }
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const stockMovement = await tx.stockMovement.create({
        data: {
          productId: data.productId,
          quantity: data.quantity,
          movementType: data.movementType,
          reason: data.reason,
          createdBy,
        },
      });

      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      let newStock: number;
      if (data.movementType === "IN") {
        newStock = product.stockQuantity + data.quantity;
      } else {
        newStock = product.stockQuantity - data.quantity;
      }

      await tx.product.update({
        where: { id: data.productId },
        data: { stockQuantity: newStock },
      });

      return stockMovement;
    });

    const movement = await this.stockMovementRepository.findById(result.id);
    if (!movement) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Failed to create stock movement");
    }
    return movement;
  }

  async getAll(): Promise<StockMovementResponse[]> {
    return await this.stockMovementRepository.findAll();
  }

  async getById(id: string): Promise<StockMovementResponse> {
    const stockMovement = await this.stockMovementRepository.findById(id);

    if (!stockMovement) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Stock movement not found"
      );
    }

    return stockMovement;
  }

  async getByProduct(productId: string): Promise<StockMovementResponse[]> {
    const productExists = await this.stockMovementRepository.productExists(
      productId
    );

    if (!productExists) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Product not found"
      );
    }

    return await this.stockMovementRepository.findByProduct(productId);
  }
}
