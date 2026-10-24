import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createCandidate,
  getCandidateById,
  getCandidates,
  updateCandidateScore,
  updateCandidateStage,
  assignCandidateToJob,
  uploadCandidateResume
} from "../controllers/candidates.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getCandidates);
router.post("/", requireAuth, createCandidate);
router.get("/:candidateId", requireAuth, getCandidateById);
router.patch("/:candidateId/score", requireAuth, updateCandidateScore);
router.patch("/:candidateId/stage", requireAuth, updateCandidateStage);
router.patch("/:candidateId/assign-job", requireAuth, assignCandidateToJob);
router.post("/:candidateId/resume", requireAuth, upload.single("resume"), uploadCandidateResume);

export default router;