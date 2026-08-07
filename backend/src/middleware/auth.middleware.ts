import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Token not found",
    });
    return;
  }

  try {
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

export function authorize(...roles: string[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Access denied",
      });
      return;
    }

    next();
  };
}