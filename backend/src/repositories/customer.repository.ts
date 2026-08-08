import { prisma } from "../lib/prisma.js";
import type { CustomerResponse } from "../interfaces/customer.interface.js";

export class CustomerRepository {
  async create(data: any, createdBy: string): Promise<CustomerResponse> {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        createdBy,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      },
    });

    return this.formatResponse(customer);
  }

  async findById(id: string): Promise<CustomerResponse | null> {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    return customer ? this.formatResponse(customer) : null;
  }

  async findByCustomerCode(customerCode: string): Promise<CustomerResponse | null> {
    const customer = await prisma.customer.findUnique({
      where: { customerCode },
    });

    return customer ? this.formatResponse(customer) : null;
  }

  async findAll(
    createdBy?: string,
    search?: string,
    customerType?: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ customers: CustomerResponse[]; total: number }> {
    const where: any = {};

    if (createdBy) {
      where.createdBy = createdBy;
    }

    if (search) {
      where.OR = [
        { customerCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers: customers.map((customer) => this.formatResponse(customer)),
      total,
    };
  }

  async update(id: string, data: any): Promise<CustomerResponse> {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      },
    });

    return this.formatResponse(customer);
  }

  async delete(id: string): Promise<void> {
    await prisma.customer.delete({
      where: { id },
    });
  }

  private formatResponse(customer: any): CustomerResponse {
    return {
      id: customer.id,
      customerCode: customer.customerCode,
      customerName: customer.customerName,
      businessName: customer.businessName,
      mobile: customer.mobile,
      email: customer.email,
      gstNumber: customer.gstNumber,
      customerType: customer.customerType,
      status: customer.status,
      address: customer.address,
      followUpDate: customer.followUpDate?.toISOString() || null,
      notes: customer.notes,
      createdBy: customer.createdBy,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
}
