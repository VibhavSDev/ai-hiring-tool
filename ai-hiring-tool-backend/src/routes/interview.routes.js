import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { interviewQuestionsHandler } from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/", requireAuth, interviewQuestionsHandler);

export default router;