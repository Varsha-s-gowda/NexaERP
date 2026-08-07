import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { AuthService } from "../services/auth.service.js";
import type { LoginRequest } from "../interfaces/auth.interface.js";

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
}