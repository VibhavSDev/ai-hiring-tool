import helmet from "helmet";
import rateLimit from "express-rate-limit";

/**
 * Configure Helmet middleware for security headers
 * Protects against: XSS, clickjacking, MIME sniffing, etc.
 */
export const getHelmetConfig = () => helmet({
  contentSecurityPolicy: {
    directives: {
      // Allow API requests from authenticated origins
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "http://localhost:5173"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});

/**
 * Rate limiter for authentication endpoints
 * Brute-force protection: max 5 attempts in 15 minutes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many login/register attempts. Please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for GET /auth/me (session check)
    return req.method === "GET" && req.path.includes("/auth/me");
  },
});

/**
 * Stricter rate limiter for password reset, registration
 * 3 attempts in 1 hour
 */
export const strictAuthRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Prevents resource exhaustion: max 100 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Custom error handler for rate limit middleware
 * Returns proper JSON error format
 */
export const handleRateLimitError = (err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: err.message || "Too many requests. Please try again later.",
      retryAfter: req.rateLimit?.resetTime,
    });
  }
  next(err);
};
