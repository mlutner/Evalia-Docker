/**
 * Error Handling Middleware
 * 
 * Centralized error handling for consistent API responses
 */

import { Request, Response, NextFunction } from "express";
import { AIServiceError } from "../aiService";

export interface APIError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error implements APIError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: APIError | AIServiceError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error details
  console.error(`[Error Handler] ${req.method} ${req.path}:`, {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    statusCode: "statusCode" in err ? err.statusCode : 500,
  });

  // Handle AI Service errors
  if (err instanceof AIServiceError) {
    return res.status(err.recoverable ? 500 : 400).json({
      error: err.message,
      taskType: err.taskType,
      recoverable: err.recoverable,
    });
  }

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.message,
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
    });
  }

  // Default error response
  const statusCode = "statusCode" in err && err.statusCode ? err.statusCode : 500;
  const message = process.env.NODE_ENV === "production" 
    ? "An unexpected error occurred" 
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Request logger middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";
    
    console[logLevel](
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
};

