import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import type { FollowUpRepository } from "../repositories/followup.repository.js";
import type {
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
  FollowUpResponse,
} from "../interfaces/followup.interface.js";

export class FollowUpService {
  constructor(private readonly followUpRepository: FollowUpRepository) {}

  async create(data: CreateFollowUpRequest, createdBy: string): Promise<FollowUpResponse> {
    return await this.followUpRepository.create(data, createdBy);
  }

  async getById(id: string): Promise<FollowUpResponse> {
    const followUp = await this.followUpRepository.findById(id);

    if (!followUp) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Follow-up not found"
      );
    }

    return followUp;
  }

  async getByCustomerId(customerId: string): Promise<FollowUpResponse[]> {
    return await this.followUpRepository.findByCustomerId(customerId);
  }

  async update(id: string, data: UpdateFollowUpRequest): Promise<FollowUpResponse> {
    const followUp = await this.followUpRepository.findById(id);

    if (!followUp) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Follow-up not found"
      );
    }

    return await this.followUpRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const followUp = await this.followUpRepository.findById(id);

    if (!followUp) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Follow-up not found"
      );
    }

    await this.followUpRepository.delete(id);
  }
}
