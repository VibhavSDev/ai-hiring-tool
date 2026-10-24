import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getHelmetConfig, apiRateLimiter } from "./src/config/security.js";
import { requestLogger, errorHandler, notFoundHandler } from "./src/middlewares/error-handler.middleware.js";

const app = express();

// ========== SECURITY MIDDLEWARE ==========
// Apply Helmet early for security headers
app.use(getHelmetConfig());

// ========== LOGGING ==========
app.use(requestLogger);

// ========== CORS & BODY PARSING ==========
// CORS config: allows credentials (cookies) from specified origin
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "16kb" }));
app.use(cookieParser());
// In server.js
import "./src/workers/scoring-job.worker.js";

app.use('/uploads', express.static('uploads'));

// ========== GENERAL RATE LIMITING ==========
// Apply general API rate limiter before routes (can override per-route if needed)
app.use(apiRateLimiter);

// ========== ROUTE IMPORTS ==========
import authRoutes from "./src/routes/auth.routes.js"
import jdRoutes from "./src/routes/job-description.routes.js";
import resumeRoutes from "./src/routes/resume.routes.js";
import scoreRoutes from "./src/routes/score.routes.js";
import embeddingRoutes from "./src/routes/embedding.routes.js";
import jobRoutes from "./src/routes/job.routes.js";
import interviewRoutes from "./src/routes/interview.routes.js";
import scoringJobRoutes from "./src/routes/scoring-job.routes.js";
import candidatesRoutes from "./src/routes/candidates.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";

// ========== API ROUTES ==========
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/job-descriptions", jdRoutes);
app.use("/api/v1/resumes", resumeRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/scores", scoreRoutes);
app.use("/api/v1/scoring-jobs", scoringJobRoutes);
app.use("/api/v1/embeddings", embeddingRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/candidates", candidatesRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

// ========== ERROR HANDLING ==========
// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
