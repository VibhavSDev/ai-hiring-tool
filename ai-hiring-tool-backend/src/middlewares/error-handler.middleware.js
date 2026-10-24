import { ApiError } from "../utils/api-error.js";

/**
 * Request logging middleware
 * Logs HTTP method, path, IP, and status code
 * Security events (failed auth, rate limits) are logged separately
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log when response is sent
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;
    
    // Log security events with elevated level
    if (status === 401 || status === 403 || status === 429) {
      console.warn(
        `[SECURITY] ${method} ${path} - Status: ${status} - IP: ${ip} - Duration: ${duration}ms`
      );
    } else if (status >= 500) {
      console.error(
        `[ERROR] ${method} ${path} - Status: ${status} - IP: ${ip} - Duration: ${duration}ms`
      );
    } else if (status >= 400) {
      console.warn(
        `[WARNING] ${method} ${path} - Status: ${status} - IP: ${ip} - Duration: ${duration}ms`
      );
    } else if (process.env.LOG_LEVEL === "debug") {
      console.log(
        `[${method}] ${path} - Status: ${status} - Duration: ${duration}ms`
      );
    }
  });
  
  next();
};

/**
 * Global error handler for async route handlers
 * Catches errors from async/await in controllers and formats response
 */
export const errorHandler = (err, req, res, next) => {
  console.error("[ERROR_HANDLER]", {
    message: err.message,
    stack: err.stack,
    code: err.statusCode || 500,
  });

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Handle unexpected errors
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production"
    ? "Internal server error"
    : err.message || "Internal server error";

  // Add this inside errorHandler before the final return
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(val => val.message).join(", "),
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};
