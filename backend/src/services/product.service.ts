import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import type { ProductRepository } from "../repositories/product.repository.js";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  ProductResponse,
} from "../interfaces/product.interface.js";
import { Role } from "@prisma/client";

export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(data: CreateProductRequest): Promise<ProductResponse> {
    const existingProduct = await this.productRepository.findByProductCode(
      data.productCode
    );

    if (existingProduct) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Product code already exists"
      );
    }

    const warehouseExists = await this.productRepository.warehouseExists(
      data.warehouseId
    );

    if (!warehouseExists) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Warehouse not found"
      );
    }

    if (data.purchasePrice < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Purchase price must be non-negative"
      );
    }

    if (data.sellingPrice < data.purchasePrice) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Selling price must be greater than or equal to purchase price"
      );
    }

    if (data.gstPercentage !== undefined && data.gstPercentage < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "GST percentage must be non-negative"
      );
    }

    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Stock quantity must be non-negative"
      );
    }

    if (data.minimumStock !== undefined && data.minimumStock < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Minimum stock must be non-negative"
      );
    }

    return await this.productRepository.create(data);
  }

  async getById(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Product not found"
      );
    }

    return product;
  }

  async getAll(
    search?: string,
    category?: string,
    status?: string,
    warehouseId?: string,
    page: number = 1,
    limit: number = 10,
    inventoryStatus?: string
  ): Promise<{ products: ProductResponse[]; total: number }> {
    return await this.productRepository.findAll(search, category, status, warehouseId, page, limit, inventoryStatus);
  }

  async update(id: string, data: UpdateProductRequest, userRole: Role): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Product not found"
      );
    }

    if (userRole === Role.WAREHOUSE) {
      if (data.purchasePrice !== undefined || data.sellingPrice !== undefined) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Access denied: Cannot modify prices"
        );
      }
    }

    if (data.productCode && data.productCode !== product.productCode) {
      const existingProduct = await this.productRepository.findByProductCode(
        data.productCode
      );

      if (existingProduct) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Product code already exists"
        );
      }
    }

    if (data.warehouseId) {
      const warehouseExists = await this.productRepository.warehouseExists(
        data.warehouseId
      );

      if (!warehouseExists) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "Warehouse not found"
        );
      }
    }

    if (data.purchasePrice !== undefined && data.purchasePrice < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Purchase price must be non-negative"
      );
    }

    const currentSellingPrice = data.sellingPrice ?? product.sellingPrice;
    const currentPurchasePrice = data.purchasePrice ?? product.purchasePrice;

    if (currentSellingPrice < currentPurchasePrice) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Selling price must be greater than or equal to purchase price"
      );
    }

    if (data.gstPercentage !== undefined && data.gstPercentage < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "GST percentage must be non-negative"
      );
    }

    if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Stock quantity must be non-negative"
      );
    }

    if (data.minimumStock !== undefined && data.minimumStock < 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Minimum stock must be non-negative"
      );
    }

    return await this.productRepository.update(id, data);
  }

  async delete(id: string, userRole: Role): Promise<void> {
    if (userRole === Role.WAREHOUSE) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Product not found"
      );
    }

    await this.productRepository.delete(id);
  }
}
