import type { Response, Request, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

interface ApiErrorResponse {
  message: string;
  success: boolean;
  status: number;
  timestamp: string;
  errors?: Record<string, string>;
}

function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const error: ApiErrorResponse = {
    message: "Something went wrong",
    success: false,
    status: 500,
    timestamp: new Date().toISOString(),
  };

  // Custom AppError
  if (err instanceof AppError) {
    error.message = err.message;
    error.status = err.statusCode;
    res.status(error.status).json(error);
    return;
  }

  // Mongoose validation error
  if (err instanceof MongooseError.ValidationError) {
    const firstKey = Object.keys(err.errors)[0];
    error.message = firstKey
      ? err.errors[firstKey]?.message ?? "Validation error"
      : "Validation error";
    error.status = 400;
    res.status(400).json(error);
    return;
  }

  // Mongoose duplicate key
  if (
    err instanceof Error &&
    "code" in err &&
    (err as Record<string, unknown>).code === 11000
  ) {
    const keyValue = (err as Record<string, unknown>).keyValue as Record<string, unknown> | undefined;
    const field = keyValue ? Object.keys(keyValue)[0] : "field";
    error.message = `Duplicate value for ${field}. Please use a different value.`;
    error.status = 400;
    res.status(400).json(error);
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err instanceof MongooseError.CastError) {
    error.message = `Invalid ${err.path}: ${String(err.value)}`;
    error.status = 400;
    res.status(400).json(error);
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const firstError = err.errors[0];
    if (firstError) {
      error.message =
        firstError.message === "Required"
          ? `${firstError.path.join(".")} is required`
          : firstError.message;
    } else {
      error.message = "Validation failed";
    }
    error.status = 400;
    res.status(400).json(error);
    return;
  }

  // Multer error
  if (err instanceof Error && err.message.includes("File too large")) {
    error.message = "File too large. Maximum size is 5MB.";
    error.status = 400;
    res.status(400).json(error);
    return;
  }

  // Generic Error
  if (err instanceof Error) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, {
      stack: err.stack,
      ip: req.ip,
      userId: req.user?._id,
    });
    error.message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;
    res.status(500).json(error);
    return;
  }

  // String error
  if (typeof err === "string") {
    error.message = err;
    error.status = 400;
    res.status(400).json(error);
    return;
  }

  logger.error("Unknown error type", { error: err, ip: req.ip });
  res.status(500).json(error);
}

function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
}

export { errorHandler, notFoundHandler };
