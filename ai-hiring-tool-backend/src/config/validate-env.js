/**
 * Check that all required environment variables are set
 * Fails fast on startup if dependencies are missing
 */
export const validateEnvironment = () => {
  const required = [
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRY",
    "MONGO_URI",
    "CORS_ORIGIN",
  ];

  const optional = [
    "NODE_ENV",
    "PORT",
    "GEMINI_API_KEY",
    "EMBEDDING_PROVIDER",
    "HF_API_KEY",
    "REDIS_URL",
    "LOG_LEVEL",
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Check your .env file against .env.example`
    );
  }

  // Warn about missing optional vars
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0 && process.env.NODE_ENV !== "test") {
    console.warn(
      `[WARNING] Missing optional environment variables: ${missingOptional.join(", ")}`
    );
  }

  // Validate format of expiry variables
  const validateDuration = (key) => {
    const value = process.env[key];
    if (!/^\d+[smhd]?$|^\d+$/.test(value)) {
      throw new Error(
        `Invalid format for ${key}: "${value}". ` +
        `Expected format like "3600", "1h", "7d", or "60s"`
      );
    }
  };

  validateDuration("ACCESS_TOKEN_EXPIRY");
  validateDuration("REFRESH_TOKEN_EXPIRY");

  console.log("[CONFIG] Environment variables validated");
};
