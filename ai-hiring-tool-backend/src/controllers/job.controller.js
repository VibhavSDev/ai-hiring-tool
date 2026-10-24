import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Job } from "../models/job.model.js";
import { Candidate } from "../models/candidate.model.js"; // Explicitly imported Candidate model
import mongoose_models from "mongoose"; 
const { models } = mongoose_models; // Used for cascade deletion

import { parseJobDescription } from "../services/gemini.service.js";
import { getOrCreateEmbedding } from "../services/embedding.service.js";

/**
 * @desc    Create a new Job (Parses with AI + Generates Embeddings)
 * @route   POST /api/v1/jobs
 * @access  Private
 */
export const createJob = asyncHandler(async (req, res) => {
  const { text, department } = req.body;
  const actorUserId = req.user?._id;

  // 1. Validation
  if (!text || typeof text !== "string" || text.trim().length < 20) {
    throw new ApiError(400, "Job description text must be at least 20 characters");
  }

  // Prevent duplicates
  const existingJob = await Job.findOne({
    title: req.body.title,
    department: req.body.department,
    rawText: text // Check against raw text to prevent exact duplicate postings
  });

  if (existingJob) {
    return res.status(409).json({ message: "This job post already exists." });
  }

  // 2. Parallel AI Execution (Optimization)
  let parsedJD, embedding;
  try {
    const [parsedResult, embeddingResult] = await Promise.all([
      parseJobDescription(text),
      getOrCreateEmbedding(text)
    ]);
    parsedJD = parsedResult;
    embedding = embeddingResult;
  } catch (err) {
    console.error("AI Service Error:", err);
    throw new ApiError(502, "AI Services failed to process job description");
  }

  // 3. Persist Job to DB
  const job = await Job.create({
    createdBy: actorUserId,
    title: parsedJD?.title || "Untitled Position",
    department: department || parsedJD?.department || "General",
    rawText: text,
    parsed: parsedJD,
    embeddingKey: embedding.key,
    embeddingDim: embedding.dim,
    embedding: embedding.embedding,
    status: "active"
  });

  return res.status(201).json(
    new ApiResponse(
      201, 
      {
        id: job._id,
        title: job.title,
        department: job.department,
        createdAt: job.createdAt
      }, 
      "Job created and parsed successfully"
    )
  );
});

/**
 * @desc    Get all jobs with pagination, search, filters, and pipeline counts
 * @route   GET /api/v1/jobs
 * @access  Private
 */
export const getAllJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, status, sort = "createdAt", order = "desc" } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = order === "desc" ? -1 : 1;

  // 1. Build Match Query for the aggregation
  const matchQuery = { createdBy: req.user._id };

  if (status && status !== "all") {
    matchQuery.status = status;
  }

  if (search) {
    matchQuery.$or = [
      { title: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
      { "parsed.title": { $regex: search, $options: "i" } }
    ];
  }

  // 2. Execute Aggregation Pipeline
  const jobsData = await Job.aggregate([
    { $match: matchQuery },
    // Join with Candidates collection (The New Bridge)
    {
      $lookup: {
        from: "candidates", // Maps to your Candidate collection
        localField: "_id",
        foreignField: "jobId",
        as: "candidates"
      }
    },
    // Add counts for the UI (both aliases point to the candidate count now)
    {
      $addFields: {
        resumeCount: { $size: "$candidates" }, 
        candidateCount: { $size: "$candidates" }
      }
    },
    { $project: { candidates: 0 } }, // Remove heavy array
    { $sort: { [sort]: sortOrder } },
    {
      $facet: {
        metadata: [{ $count: "totalItems" }],
        data: [{ $skip: skip }, { $limit: limitNum }]
      }
    }
  ]);

  const totalItems = jobsData[0].metadata[0]?.totalItems || 0;
  const jobs = jobsData[0].data;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
          currentPage: pageNum,
          limit: limitNum
        }
      },
      "Jobs retrieved successfully"
    )
  );
});

/**
 * @desc    Get a single job by ID (with aggregated counts)
 * @route   GET /api/v1/jobs/:jobId
 */
export const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  const jobData = await Job.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(jobId) } },
    // Lookup Candidates attached to this job
    {
      $lookup: {
        from: "candidates",
        localField: "_id",
        foreignField: "jobId",
        as: "candidates",
      },
    },
    // Lookup ScoringJobs to get the 'lastScoredAt' date for the UI
    {
      $lookup: {
        from: "scoringjobs",
        localField: "_id",
        foreignField: "jobId",
        as: "scoringJobs",
      },
    },
    {
      $addFields: {
        candidateCount: { $size: "$candidates" },
        resumeCount: { $size: "$candidates" },
        lastScoredAt: { $max: "$scoringJobs.createdAt" }
      },
    },
    { $project: { candidates: 0, scoringJobs: 0 } },
  ]);

  if (!jobData?.length) {
    throw new ApiError(404, "Job not found");
  }

  return res.status(200).json(
    new ApiResponse(200, jobData[0], "Job details retrieved successfully")
  );
});

export const getCandidatesByJobId = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  // 1. Verify job exists
  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  // 2. Fetch all candidates linked to this job using aggregation or population
  const candidates = await Candidate.aggregate([
    { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
    // Optional: Lookup any related scoring data if stored in a separate collection or embedded
    // If your scoring data is embedded directly in the candidate schema as 'scoring', this is already available.
    { $sort: { createdAt: -1 } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, { candidates }, "Job candidates retrieved successfully")
  );
});

/**
 * @desc    Delete a job and its associated data
 * @route   DELETE /api/v1/jobs/:jobId
 * @access  Private
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  const job = await Job.findOne({
    _id: jobId,
    createdBy: req.user._id // Security: Only owner can delete
  });

  if (!job) {
    throw new ApiError(404, "Job not found or unauthorized");
  }

  // CASCADE DELETIONS: Wipe out bridged records for this Job
  if (models.Candidate) await models.Candidate.deleteMany({ jobId });
  if (models.ScoringJob) await models.ScoringJob.deleteMany({ jobId });
  if (models.Resume) await models.Resume.deleteMany({ jobId });

  await job.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Job and associated data deleted successfully")
  );
});

export const updateJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const updates = req.body;

  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!job) throw new ApiError(404, "Job not found or unauthorized");

  return res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
});