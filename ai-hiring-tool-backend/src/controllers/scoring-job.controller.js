// src/controllers/scoringJob.controller.js
import { ScoringJob } from "../models/scoring-job.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Job } from "../models/job.model.js";
import { Candidate } from "../models/candidate.model.js"; // REPLACED: Resume with Candidate
import mongoose from "mongoose";
import { scoringQueue } from "../workers/queue.js"; // Assuming BullMQ is still here

/**
 * @desc    Get all scoring runs for a specific Job ID (For the Live Scoring Modal)
 * @route   GET /api/v1/scoring-jobs/job/:jobId
 * @access  Private
 */
export const getScoringJobsByJobId = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  // 1. Fetch runs with metadata for the "Live" modal activity feed
  const runs = await ScoringJob.find({ jobId })
    .sort({ createdAt: -1 })
    .select("status progress errorCount createdAt latestProcessedName")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { runs }, "Scoring runs retrieved for job")
  );
});

/**
 * @desc    Get real-time status of a specific Scoring Job (Polling for Modal)
 * @route   GET /api/v1/scoring-jobs/:scoringJobId/status
 * @access  Private (Owner or Admin)
 */
export const getScoringJobStatus = asyncHandler(async (req, res) => {
  const { scoringJobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(scoringJobId)) {
    throw new ApiError(400, "Invalid Scoring Job ID format");
  }

  const job = await ScoringJob.findById(scoringJobId).lean();

  if (!job) {
    throw new ApiError(404, `Scoring job ${scoringJobId} no longer exists`);
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = job.actorUserId.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    throw new ApiError(403, "Access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, {
      id: job._id,
      status: job.status,
      progress: {
        total: job.progress?.total || 0,
        processed: job.progress?.processed || 0,
        percentage: job.progress?.total > 0 
          ? Math.round((job.progress.processed / job.progress.total) * 100)
          : 0
      },
      latestProcessedName: job.latestProcessedName || "Queueing...",
      error: job.status === "failed" ? job.error?.message : null,
      timestamps: {
        created: job.createdAt,
        started: job.startedAt,
        finished: job.finishedAt
      }
    }, "Status retrieved")
  );
});

/**
 * @desc    Initialize and Trigger a new scoring run via BullMQ
 * @route   POST /api/v1/scoring-jobs
 */
export const createScoringJob = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  const job = await Job.findById(jobId).lean();
  if (!job) throw new ApiError(404, "Job profile not found");

  // THE FIX: We only score Candidates whose AI score is 0 and who have a parsed resume attached
  // This prevents re-scoring people who already have scores!
  const candidatesToScore = await Candidate.countDocuments({ 
    jobId, 
    resumeId: { $exists: true },
    "scoring.overallScore": 0 // Only score unscored candidates
  });

  if (candidatesToScore === 0) {
    throw new ApiError(400, "All candidates for this job are already scored, or no resumes are parsed yet.");
  }

  const activeJob = await ScoringJob.findOne({ jobId, status: "processing" });
  if (activeJob) {
    throw new ApiError(409, "A scoring run is already in progress for this job.");
  }

  // Create lightweight tracking record for the modal
  const newRun = await ScoringJob.create({
    jobId,
    actorUserId: req.user._id,
    status: "queued",
    progress: { 
      total: candidatesToScore, 
      processed: 0 
    }
  });

  try {
    await scoringQueue.add(
      "process-scoring", 
      { scoringJobId: newRun._id, jobId: job._id }, // Pass jobId so worker knows who to score
      { 
        attempts: 3, 
        backoff: { type: 'exponential', delay: 1000 } 
      }
    );
  } catch (queueErr) {
    console.error("Failed to add job to BullMQ:", queueErr);
    newRun.status = "failed";
    await newRun.save();
    throw new ApiError(500, "Scoring system queue is currently offline");
  }

  return res.status(201).json(
    new ApiResponse(201, newRun, "Scoring job successfully initialized and queued")
  );
});