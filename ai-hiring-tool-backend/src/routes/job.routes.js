import express from "express";
import { getAllJobs, createJob, getJobById, deleteJob, updateJob, getCandidatesByJobId } from "../controllers/job.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getAllJobs);

router.get("/:jobId", requireAuth, getJobById);

router.get("/:jobId/candidates", requireAuth, getCandidatesByJobId);

router.post("/", requireAuth, createJob);

router.delete("/:jobId", requireAuth, deleteJob);

router.patch("/:jobId", requireAuth, updateJob);


export default router;