import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { uploadResumes, parsePlainTextHandler, getResumesByJobId, retryParsing, deleteResume, shortlistResume } from "../controllers/resume.controller.js";
import { refreshResumeEmbeddingHandler } from "../controllers/resume-embedding.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/job/:jobId", requireAuth, getResumesByJobId);
router.post("/upload", requireAuth, upload.array("resumes"), uploadResumes);
router.post("/:resumeId/retry", requireAuth, retryParsing);
router.post("/parse-text", requireAuth, parsePlainTextHandler);
router.post("/:resumeId/refresh-embedding", requireAuth, refreshResumeEmbeddingHandler);
router.patch("/:resumeId/shortlist", requireAuth, shortlistResume);
router.delete("/:resumeId", requireAuth, deleteResume);

export default router;