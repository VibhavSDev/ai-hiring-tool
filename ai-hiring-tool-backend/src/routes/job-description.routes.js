import express from "express";
import { parseJDHandler } from "../controllers/job-description.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/parse", requireAuth, parseJDHandler);

export default router;
