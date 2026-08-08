import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { AuthService } from "../services/auth.service.js";
import type { LoginRequest, RegisterRequest } from "../interfaces/auth.interface.js";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: LoginRequest = req.body;

      const result = await this.authService.login(data);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
          HTTP_STATUS.OK,
          "Login successful",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: RegisterRequest = req.body;

      const result = await this.authService.register(data);

      res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
          HTTP_STATUS.CREATED,
          "Registration successful",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.listUsers();

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, 'Users retrieved successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }


  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const data = req.body;

      const result = await this.authService.updateUser(id, data);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, 'User updated successfully', result)
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);

      await this.authService.deleteUser(id);

      res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, 'User deleted successfully', null)
      );
    } catch (error) {
      next(error);
    }
  }
}