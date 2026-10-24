import express from "express";
import { login, logout, refreshAccessToken, register, getCurrentUser } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateRegister, validateLogin, handleValidationErrors } from "../middlewares/validation.middleware.js";
import { authRateLimiter, strictAuthRateLimiter } from "../config/security.js";

const router = express.Router();

// POST /auth/register: Create new user with strict rate limit and input validation
router.post("/register", strictAuthRateLimiter, validateRegister, handleValidationErrors, register);

// POST /auth/login: Authenticate user with rate limit and input validation
router.post("/login", authRateLimiter, validateLogin, handleValidationErrors, login);

// GET /auth/me: Get current user (for session rehydration)
router.get("/me", requireAuth, getCurrentUser);

// POST /auth/logout: Invalidate tokens
router.post("/logout", requireAuth, logout);

// POST /auth/refresh-token: Issue new access token
router.post("/refresh-token", refreshAccessToken);

export default router;