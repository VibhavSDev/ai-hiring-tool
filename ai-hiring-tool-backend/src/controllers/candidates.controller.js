import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Candidate } from "../models/candidate.model.js";
import { Job } from "../models/job.model.js";
import { processResumeAI } from "../services/ai.service.js";
import { extractTextFromPdf } from "../services/pdf.service.js";
import { Resume } from "../models/resume.model.js";

const validStages = ["new", "screening", "interview", "offer", "hired", "rejected"];

const buildStageHistoryEntry = (stage, note, changedBy) => ({
  stage,
  note: note?.trim() || `Moved to ${stage}`,
  changedBy,
  changedAt: new Date(),
});

/**
 * @desc    Get all candidates (powers Pipeline & Global Candidate lists)
 * @route   GET /api/v1/candidates
 */
export const getCandidates = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, stage, jobId, status = "active" } = req.query; // Increased limit default for Kanban
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 50);
  const skip = (pageNum - 1) * limitNum;

  // 1. Base query: Ensure user only sees their own candidates
  // NOTE: If you are populating candidates tied to a job, we lookup by jobId
  let matchQuery;
  
  if (jobId) {
    if (!mongoose.Types.ObjectId.isValid(jobId)) throw new ApiError(400, "Invalid job ID format");
    
    // Security: Verify the user owns the job before giving them the candidates
    const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
    if (!job) throw new ApiError(404, "Job not found or unauthorized");
    
    matchQuery = { jobId };
  } else {
    // If no jobId is provided (Global pipeline view), filter by resumes the user owns
    // In our schema, candidates don't have createdBy directly anymore (they inherit from Job/Resume)
    // To keep it simple, you could query jobs owned by user, then candidates for those jobs.
    // Assuming you still have createdBy or we just fetch jobs:
    const userJobs = await Job.find({ createdBy: req.user._id }).select('_id');
    const userJobIds = userJobs.map(j => j._id);
    matchQuery = { jobId: { $in: userJobIds } };
  }

  if (status && status !== "all") {
    matchQuery.status = status;
  }

  if (stage && stage !== "all") {
    if (!validStages.includes(stage)) throw new ApiError(400, "Invalid stage value");
    matchQuery.stage = stage;
  }

  if (search) {
    matchQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  // 2. Execute unified query
  const [totalItems, candidates] = await Promise.all([
    Candidate.countDocuments(matchQuery),
    Candidate.find(matchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("jobId", "title department status")
      // We no longer need to populate 'application' because everything is right here!
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        candidates, // Array now contains stages, scores, and identity directly
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limitNum),
          currentPage: pageNum,
          limit: limitNum,
        },
      },
      "Candidates retrieved successfully"
    )
  );
});

/**
 * @desc    Manually create a candidate (e.g., from "Add Candidate" button)
 * @route   POST /api/v1/candidates
 */
export const createCandidate = asyncHandler(async (req, res) => {
  const { jobId, name, email, phone, source = "manual", notes, summary, resumeId } = req.body;

  if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "A valid job ID is required");
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw new ApiError(400, "Candidate name is required");
  }

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "A valid email address is required");
  }

  const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
  if (!job) {
    throw new ApiError(404, "Job not found or unauthorized");
  }

  const existingCandidate = await Candidate.findOne({ jobId, email: email.toLowerCase().trim() });
  if (existingCandidate) {
    throw new ApiError(409, "A candidate with this email already exists for this job");
  }

  // Create single unified record
  const candidate = await Candidate.create({
    jobId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || "",
    source,
    notes,
    stage: "new",
    status: "active",
    stageHistory: [buildStageHistoryEntry("new", "Candidate manually added to pipeline", req.user._id)],
    scoring: { overallScore: 0 },
    resumeId: resumeId && mongoose.Types.ObjectId.isValid(resumeId) ? resumeId : undefined,
  });

  return res.status(201).json(
    new ApiResponse(201, { candidate }, "Candidate added to pipeline")
  );
});

/**
 * @desc    Get complete details for the Candidate Workspace
 * @route   GET /api/v1/candidates/:candidateId
 */
export const getCandidateById = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    throw new ApiError(400, "Invalid candidate ID format");
  }

  const candidate = await Candidate.findById(candidateId)
    .populate("jobId", "title department status")
    .populate("resumeId", "fileUrl fileKey status source parsedText skills")
    .populate("stageHistory.changedBy", "companyName email");

  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  console.log(candidate);

  return res.status(200).json(new ApiResponse(200, candidate, "Candidate retrieved successfully"));
});

/**
 * @desc    Move candidate through pipeline
 * @route   PATCH /api/v1/candidates/:candidateId/stage
 */
export const updateCandidateStage = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;
  const { stage, note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(candidateId)) throw new ApiError(400, "Invalid format");
  if (!validStages.includes(stage)) throw new ApiError(400, "Invalid stage value");

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) throw new ApiError(404, "Candidate not found");

  const trimmedNote = note?.trim();
  
  candidate.stage = stage;
  candidate.status = stage === "rejected" ? "archived" : "active";
  if (trimmedNote) candidate.notes = trimmedNote; // Overwrite current active note
  
  // Push to unified history array
  candidate.stageHistory.push(buildStageHistoryEntry(stage, trimmedNote || undefined, req.user._id));
  
  await candidate.save();

  return res.status(200).json(new ApiResponse(200, { candidate }, "Candidate stage updated"));
});

/**
 * @desc    Manual override for candidate score or notes (if needed by recruiters)
 * @route   PATCH /api/v1/candidates/:candidateId/score
 */
export const updateCandidateScore = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;
  const { score, feedback } = req.body;

  if (!mongoose.Types.ObjectId.isValid(candidateId)) throw new ApiError(400, "Invalid format");

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) throw new ApiError(404, "Candidate not found");

  // Update AI/Manual score
  if (typeof score !== "undefined") {
    const parsedScore = Number(score);
    if (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      throw new ApiError(400, "Score must be between 0 and 100");
    }
    candidate.scoring.overallScore = parsedScore;
  }

  // Record manual feedback in history
  if (typeof feedback === "string" && feedback.trim()) {
    candidate.notes = feedback.trim();
    candidate.stageHistory.push({
        stage: candidate.stage,
        note: `Feedback added: ${feedback.trim()}`,
        changedBy: req.user._id,
        changedAt: new Date()
    });
  }

  await candidate.save();

  return res.status(200).json(new ApiResponse(200, { candidate }, "Candidate evaluation updated"));
});

export const assignCandidateToJob = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;
  const { jobId } = req.body;

  if (!jobId) {
    throw new ApiError(400, "Job ID is required for assignment");
  }

  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  // Update the candidate's job reference
  candidate.jobId = jobId;
  await candidate.save();

  // The Bridge: Sync the Resume document so it appears in the Job Details view
  if (candidate.resumeId) {
    await Resume.findByIdAndUpdate(
      candidate.resumeId, 
      { jobId: jobId },
      { new: true }
    );
  }

  // Populate job details before returning so the frontend updates smoothly
  const updatedCandidate = await Candidate.findById(candidateId).populate("jobId", "title department status");

  return res.status(200).json(
    new ApiResponse(200, { candidate: updatedCandidate }, "Candidate successfully assigned to job")
  );
});

export const uploadCandidateResume = asyncHandler(async (req, res) => {
  const { candidateId } = req.params;
  const file = req.file; // Note: req.file (single) instead of req.files (array)

  if (!file) {
    throw new ApiError(400, "No file provided for upload");
  }

  // 1. Verify the candidate exists
  const candidate = await Candidate.findById(candidateId);
  if (!candidate) {
    throw new ApiError(404, "Candidate not found");
  }

  try {
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${file.filename}`;
    const fileKey = file.filename;

    // 2. Extract raw text
    const text = await extractTextFromPdf(file.path);

    // Ensure we extract the raw ObjectId if jobId is already populated
    const inheritedJobId = candidate.jobId?._id || candidate.jobId || undefined;

    // 3. Create the processing Resume document
    const resume = await Resume.create({
      uploadedBy: req.user._id,
      jobId: inheritedJobId, 
      status: "processing",
      source: "pdf",
      fileUrl,
      fileKey,
      rawText: text,
      name: candidate.name || file.originalname.split('.')[0],
      email: candidate.email || "extracting...",
      parseConfidence: 0,
    });

    // 4. Link the new Resume to the Candidate immediately (so UI updates)
    candidate.resumeId = resume._id;
    if (!candidate.source || candidate.source === "Manual") {
      candidate.source = "upload"; 
    }
    await candidate.save();

    // 5. Trigger Background AI Task (Non-blocking)
    // Matches your exact function signature: processResumeAI(resumeId, rawText, fileName)
    processResumeAI(resume._id, text, file.originalname);

    // 6. Return populated candidate so the frontend workspace updates instantly
    const updatedCandidate = await Candidate.findById(candidateId)
      .populate("jobId", "title department status")
      .populate("resumeId", "fileUrl fileKey status skills");

    return res.status(201).json(
      new ApiResponse(
        201, 
        { candidate: updatedCandidate }, 
        "Resume document attached successfully. AI parsing is running in the background."
      )
    );
  } catch (err) {
    console.error(`❌ Single processing failed for ${file?.originalname}:`, err.message);
    throw new ApiError(500, "Failed to process the uploaded resume document.");
  }
});