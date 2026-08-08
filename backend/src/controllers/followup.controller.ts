import type { Request, Response, NextFunction } from "express";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

import type {
  CreateFollowUpRequest,
  UpdateFollowUpRequest,
} from "../interfaces/followup.interface.js";
import type { FollowUpService } from "../services/followup.service.js";

export class FollowUpController {
  constructor(private readonly followUpService: FollowUpService) {}

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: CreateFollowUpRequest = req.body;
      const createdBy = (req as any).user?.userId;

      if (!createdBy) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "User authentication required"
        );
      }

      const result = await this.followUpService.create(data, createdBy);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Follow-up created successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Follow-up ID is required"
        );
      }

      const idString = Array.isArray(id) ? id[0] : id;
      if (!idString) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Follow-up ID is required"
        );
      }

      const result = await this.followUpService.getById(idString);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Follow-up retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getByCustomerId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { customerId } = req.params;

      if (!customerId) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Customer ID is required"
        );
      }

      const customerIdString = Array.isArray(customerId) ? customerId[0] : customerId;
      if (!customerIdString) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Customer ID is required"
        );
      }

      const result = await this.followUpService.getByCustomerId(customerIdString);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Follow-ups retrieved successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Follow-up ID is required"
        );
      }

      const idString = Array.isArray(id) ? id[0] : id;
      if (!idString) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Follow-up ID is required"
        );
      }

      const data: UpdateFollowUpRequest = req.body;

      const result = await this.followUpService.update(idString, data);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Follow-up updated successfully",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Follow-up ID is required"
        );
      }

      const idString = Array.isArray(id) ? id[0] : id;
      if (!idString) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Follow-up ID is required"
        );
      }

      await this.followUpService.delete(idString);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Follow-up deleted successfully"
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
