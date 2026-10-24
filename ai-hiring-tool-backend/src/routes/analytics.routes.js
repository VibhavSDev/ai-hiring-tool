import express from "express";
import { getDashboardSummary } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", requireAuth, getDashboardSummary);

export default router;