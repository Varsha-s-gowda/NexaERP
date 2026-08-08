import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { prisma } from "../lib/prisma.js";
import type { SalesChallanRepository } from "../repositories/salesChallan.repository.js";
import type {
  CreateSalesChallanRequest,
  UpdateSalesChallanStatusRequest,
  SalesChallanResponse,
} from "../interfaces/salesChallan.interface.js";
import { Role } from "@prisma/client";

export class SalesChallanService {
  constructor(private readonly salesChallanRepository: SalesChallanRepository) {}

  async create(data: CreateSalesChallanRequest, createdBy: string): Promise<SalesChallanResponse> {
    const customerExists = await this.salesChallanRepository.customerExists(
      data.customerId
    );

    if (!customerExists) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Customer not found"
      );
    }

    for (const item of data.items) {
      const productExists = await this.salesChallanRepository.productExists(
        item.productId
      );

      if (!productExists) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          `Product with ID ${item.productId} not found`
        );
      }
    }

    const challanNumber = await this.generateChallanNumber();

    const result = await prisma.$transaction(async (tx: any) => {
      let totalQuantity = 0;
      let totalAmount = 0;

      const challanItems = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        const totalPrice = Number(product.sellingPrice) * item.quantity;

        challanItems.push({
          productId: item.productId,
          productCode: product.productCode,
          productName: product.productName,
          sellingPrice: product.sellingPrice,
          quantity: item.quantity,
          totalPrice,
        });

        totalQuantity += item.quantity;
        totalAmount += totalPrice;
      }

      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          totalQuantity,
          totalAmount,
          status: "DRAFT",
          createdBy,
          items: {
            create: challanItems,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      return challan;
    });

    return this.salesChallanRepository.formatResponse(result);
  }

  async getAll(userId: string, userRole: Role, page: number = 1, limit: number = 10, search?: string, status?: string, customerId?: string, startDate?: string, endDate?: string): Promise<{ challans: SalesChallanResponse[], total: number }> {
    if (userRole === Role.ADMIN || userRole === Role.ACCOUNTS) {
      return await this.salesChallanRepository.findAll(undefined, page, limit, search, status, customerId, startDate, endDate);
    }
    return await this.salesChallanRepository.findAll(userId, page, limit, search, status, customerId, startDate, endDate);
  }

  async getById(id: string, userId: string, userRole: Role): Promise<SalesChallanResponse> {
    const challan = await this.salesChallanRepository.findById(id);

    if (!challan) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Sales challan not found"
      );
    }

    if (userRole === Role.SALES && challan.createdBy !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    return challan;
  }

  async updateStatus(id: string, data: UpdateSalesChallanStatusRequest, userId: string, userRole: Role): Promise<SalesChallanResponse> {
    const challan = await this.salesChallanRepository.findById(id);

    if (!challan) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Sales challan not found"
      );
    }

    if (userRole === Role.SALES) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied: Cannot confirm or cancel challans"
      );
    }

    if (userRole === Role.ACCOUNTS) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied: Cannot modify challan status"
      );
    }

    if (data.status === "CONFIRMED" && challan.status === "DRAFT") {
      await this.deductStock(id);
    }

    if (data.status === "CANCELLED" && challan.status !== "CANCELLED") {
      await this.restoreStock(id);
    }

    return await this.salesChallanRepository.updateStatus(id, data.status);
  }

  private async deductStock(challanId: string): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id: challanId },
        include: {
          items: true,
        },
      });

      if (!challan) {
        throw new Error("Challan not found");
      }

      for (const item of challan.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product.productName}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: product.stockQuantity - item.quantity,
          },
        });
      }
    });
  }

  private async restoreStock(challanId: string): Promise<void> {
    await prisma.$transaction(async (tx: any) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id: challanId },
        include: {
          items: true,
        },
      });

      if (!challan) {
        throw new Error("Challan not found");
      }

      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });
  }

  private async generateChallanNumber(): Promise<string> {
    const latestNumber = await this.salesChallanRepository.findLatestChallanNumber();

    if (!latestNumber) {
      return "CH-000001";
    }

    const parts = latestNumber.split("-");
    const numericPart = parts.length > 1 ? parts[1] : "0";
    const nextNumber = parseInt(numericPart || "0", 10) + 1;

    return `CH-${String(nextNumber).padStart(6, "0")}`;
  }
}
