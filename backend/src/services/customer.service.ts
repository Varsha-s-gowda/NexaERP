import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import type { CustomerRepository } from "../repositories/customer.repository.js";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerResponse,
} from "../interfaces/customer.interface.js";
import { Role } from "@prisma/client";

export class CustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async create(data: CreateCustomerRequest, createdBy: string): Promise<CustomerResponse> {
    const existingCustomer = await this.customerRepository.findByCustomerCode(
      data.customerCode
    );

    if (existingCustomer) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "Customer code already exists"
      );
    }

    return await this.customerRepository.create(data, createdBy);
  }

  async getById(id: string, userId: string, userRole: Role): Promise<CustomerResponse> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Customer not found"
      );
    }

    if (userRole !== Role.ADMIN && userRole !== Role.ACCOUNTS && customer.createdBy !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    return customer;
  }

  async getAll(userId: string, userRole: Role): Promise<CustomerResponse[]> {
    if (userRole === Role.ADMIN || userRole === Role.ACCOUNTS) {
      return await this.customerRepository.findAll();
    }
    return await this.customerRepository.findAll(userId);
  }

  async update(id: string, data: UpdateCustomerRequest, userId: string, userRole: Role): Promise<CustomerResponse> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Customer not found"
      );
    }

    if (userRole !== Role.ADMIN && userRole !== Role.ACCOUNTS && customer.createdBy !== userId) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    if (data.customerCode && data.customerCode !== customer.customerCode) {
      const existingCustomer = await this.customerRepository.findByCustomerCode(
        data.customerCode
      );

      if (existingCustomer) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Customer code already exists"
        );
      }
    }

    return await this.customerRepository.update(id, data);
  }

  async delete(id: string, userRole: Role): Promise<void> {
    if (userRole === Role.SALES) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "Access denied"
      );
    }

    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Customer not found"
      );
    }

    await this.customerRepository.delete(id);
  }
}
