import { prisma } from "../lib/prisma.js";
import type { WarehouseResponse } from "../interfaces/warehouse.interface.js";

export class WarehouseRepository {
  async create(data: any): Promise<WarehouseResponse> {
    const warehouse = await prisma.warehouse.create({
      data,
    });

    return this.formatResponse(warehouse);
  }

  async findById(id: string): Promise<WarehouseResponse | null> {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    return warehouse ? this.formatResponse(warehouse) : null;
  }

  async findByName(name: string): Promise<WarehouseResponse | null> {
    const warehouse = await prisma.warehouse.findUnique({
      where: { name },
    });

    return warehouse ? this.formatResponse(warehouse) : null;
  }

  async findAll(): Promise<WarehouseResponse[]> {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { createdAt: "desc" },
    });

    return warehouses.map((warehouse) => this.formatResponse(warehouse));
  }

  async update(id: string, data: any): Promise<WarehouseResponse> {
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data,
    });

    return this.formatResponse(warehouse);
  }

  async delete(id: string): Promise<void> {
    await prisma.warehouse.delete({
      where: { id },
    });
  }

  async hasProducts(warehouseId: string): Promise<boolean> {
    const productCount = await prisma.product.count({
      where: { warehouseId },
    });

    return productCount > 0;
  }

  private formatResponse(warehouse: any): WarehouseResponse {
    return {
      id: warehouse.id,
      name: warehouse.name,
      location: warehouse.location,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt.toISOString(),
      updatedAt: warehouse.updatedAt.toISOString(),
    };
  }
}
