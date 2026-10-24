import { parseDurationToMs } from "../utils/parse-duration.js";

/**
 * Centralized cookie options for tokens.
 * Ensures consistent, secure cookie flags across all auth endpoints.
 */
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, // Prevent JavaScript from accessing the cookie (XSS mitigation)
    secure: isProduction, // Only send over HTTPS in production
    sameSite: isProduction ? "none" : "lax", // 'none' requires secure: true; 'lax' for dev
    maxAge: isProduction ? 7 * 24 * 60 * 60 * 1000 : undefined, // 7 days in production
    path: "/",
  };
};

export const getAccessTokenCookieOptions = () => ({
  ...getCookieOptions(),
  maxAge: parseDurationToMs(process.env.ACCESS_TOKEN_EXPIRY || "1h"),
});

export const getRefreshTokenCookieOptions = () => ({
  ...getCookieOptions(),
  maxAge: parseDurationToMs(process.env.REFRESH_TOKEN_EXPIRY || "7d"),
});
