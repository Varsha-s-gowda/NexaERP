import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { Role } from "@prisma/client";

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "User authentication required"
        )
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "Access denied"
        )
      );
    }

    next();
  };
}
