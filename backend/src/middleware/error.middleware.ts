import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal Server Error",
  });
}