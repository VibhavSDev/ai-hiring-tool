import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

/**
 * Middleware to verify access token and attach user to request.
 * Checks Authorization header first, then falls back to accessToken cookie.
 * On token expiry, returns 401 to trigger client-side refresh flow.
 */
export const requireAuth = asyncHandler(async(req, res, next) => {
  try {
    // Extract token from Authorization header (preferred) or cookie
    let token = null;
    
    const authHeader = req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    } else {
      token = req.cookies?.accessToken;
    }

    if (!token) {
      throw new ApiError(401, "Access token missing");
    }

    // Verify token signature and expiry
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(401, "Access token expired");
      } else if (error.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid access token");
      }
      throw error;
    }

    // Ensure user still exists
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    // Re-throw ApiError or wrap other errors
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, error?.message || "Authentication failed");
  }
})