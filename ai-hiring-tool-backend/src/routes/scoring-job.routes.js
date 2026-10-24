import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
    createScoringJob,
    getScoringJobsByJobId,
    getScoringJobStatus
} from "../controllers/scoring-job.controller.js";

const router = express.Router();

// Trigger the worker
router.post('/', requireAuth, createScoringJob);

// Fetch all runs for a job (for the Live Modal)
router.get('/job/:jobId', requireAuth, getScoringJobsByJobId);

// Poll for real-time progress
router.get('/:scoringJobId/status', requireAuth, getScoringJobStatus);

export default router;