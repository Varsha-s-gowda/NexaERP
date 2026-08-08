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

    // Validate warehouse requirements based on movement type
    if (data.movementType === "IN") {
      if (!data.toWarehouseId) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Destination warehouse is required for STOCK IN"
        );
      }
    } else if (data.movementType === "OUT") {
      if (!data.fromWarehouseId) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Source warehouse is required for STOCK OUT"
        );
      }
    } else if (data.movementType === "TRANSFER") {
      if (!data.fromWarehouseId || !data.toWarehouseId) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Both source and destination warehouses are required for TRANSFER"
        );
      }
      if (data.fromWarehouseId === data.toWarehouseId) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Source and destination warehouses cannot be the same"
        );
      }
    }

    // Check stock availability for OUT and TRANSFER
    if (data.movementType === "OUT" || data.movementType === "TRANSFER") {
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
          status: "COMPLETED",
          reason: data.reason || null,
          fromWarehouseId: data.fromWarehouseId || null,
          toWarehouseId: data.toWarehouseId || null,
          createdBy,
        },
      });

      // Handle stock updates based on movement type
      if (data.movementType === "IN") {
        // For STOCK IN, we need to find or create product in destination warehouse
        // Since products have a single warehouseId in current schema, we update the main product
        const product = await tx.product.findUnique({
          where: { id: data.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        const newStock = product.stockQuantity + data.quantity;
        await tx.product.update({
          where: { id: data.productId },
          data: { stockQuantity: newStock },
        });
      } else if (data.movementType === "OUT") {
        const product = await tx.product.findUnique({
          where: { id: data.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        const newStock = product.stockQuantity - data.quantity;
        await tx.product.update({
          where: { id: data.productId },
          data: { stockQuantity: newStock },
        });
      } else if (data.movementType === "TRANSFER") {
        // TRANSFER: Decrease from source, increase to destination
        // Since current schema has single warehouseId per product, we just update the main stock
        // In a more complex schema, we'd track stock per warehouse
        const product = await tx.product.findUnique({
          where: { id: data.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        // For TRANSFER, net stock change is 0 (just moving between warehouses)
        // But we still record the movement
        // In current schema, we don't track per-warehouse stock, so we just log the transfer
      }

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
