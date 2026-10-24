import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { scoreSingle } from "../controllers/scoring.controller.js";

const router = express.Router();

router.post("/score", requireAuth, scoreSingle);

export default router;