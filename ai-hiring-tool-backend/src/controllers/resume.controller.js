import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { extractTextFromPdf } from "../services/pdf.service.js";
import { parseResumeWithAI } from "../services/gemini.service.js";
import { Resume } from "../models/resume.model.js";
import { Candidate } from "../models/candidate.model.js";
import { syncCandidateFromResume, processResumeAI } from "../services/ai.service.js"; // Added processResumeAI
import fs from 'fs';
import path from 'path';
import mongoose from "mongoose";

/**
 * @desc    Get all resumes linked to a specific Job ID
 * @route   GET /api/v1/resumes/job/:jobId
 */
export const getResumesByJobId = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { page = 1, limit = 10, status, sortBy = "createdAt", order = "desc" } = req.query;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  const query = { jobId: new mongoose.Types.ObjectId(jobId) };
  if (status && status !== "all") query.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };

  const [totalResumes, resumes] = await Promise.all([
    Resume.countDocuments(query),
    Resume.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select("-embedding -rawText") // Keep payload extremely lightweight
      .lean()
  ]);

  const stats = await Resume.aggregate([
    { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
    {
      $group: {
        _id: null,
        parsed: { $sum: { $cond: [{ $eq: ["$status", "parsed"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] } },
      }
    }
  ]);

  const resumeStats = stats[0] || { parsed: 0, failed: 0, processing: 0 };

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        resumes,
        stats: resumeStats,
        pagination: {
          totalItems: totalResumes,
          totalPages: Math.ceil(totalResumes / limitNum),
          currentPage: pageNum,
        }
      },
      "Resumes retrieved successfully"
    )
  );
});

/**
 * @desc    Upload new resumes in bulk (supports both Job-specific and General Pool)
 * @route   POST /api/v1/resumes/upload
 */
export const uploadResumes = asyncHandler(async (req, res) => {
  let { jobId } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    throw new ApiError(400, "No files provided for upload");
  }

  // 1. Sanitize the jobId (handle FormData stringifying null/undefined values)
  if (!jobId || jobId === "undefined" || jobId === "null" || jobId === "") {
    jobId = undefined; // Force it to be standard JS undefined for the general pool
  } else if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid Job ID format");
  }

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      try {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/resumes/${file.filename}`;
        const fileKey = file.filename;

        const text = await extractTextFromPdf(file.path);

        // 2. Create the Resume document
        const resume = await Resume.create({
          uploadedBy: req.user._id,
          jobId: jobId, // Will now safely be a valid ObjectId or completely undefined
          status: "processing",
          source: "pdf",
          fileUrl,
          fileKey,
          rawText: text,
          name: file.originalname.split('.')[0],
          email: "extracting...",
          parseConfidence: 0,
        });

        // 3. Background AI Task (Non-blocking)
        processResumeAI(resume._id, text, file.originalname);

        return { id: resume._id, fileName: file.originalname, status: "success" };
      } catch (err) {
        console.error(`❌ Processing failed for ${file.originalname}:`, err.message);
        return { fileName: file.originalname, status: "failed", error: err.message };
      }
    })
  );

  return res.status(201).json(
    new ApiResponse(201, uploadResults, "Upload success. AI parsing is running in the background.")
  );
});

/**
 * @desc    Retry parsing for a failed or low-confidence resume
 * @route   POST /api/v1/resumes/:resumeId/retry
 */
export const retryParsing = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;

  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError(404, "Resume not found");

  resume.status = "processing";
  await resume.save();

  try {
    const localPath = path.join(process.cwd(), 'uploads', 'resumes', resume.fileKey);
    if (!fs.existsSync(localPath)) throw new ApiError(404, "Physical resume file not found.");

    const text = await extractTextFromPdf(localPath);
    const aiData = await parseResumeWithAI(text);

    resume.name = aiData.name || resume.name;
    resume.email = aiData.email || resume.email;
    resume.phone = aiData.phone || resume.phone;
    resume.skills = aiData.skills || [];
    resume.experienceYears = aiData.experience_years || 0;
    resume.parseConfidence = aiData.confidence || 0;
    resume.summary = aiData.summary || "";
    resume.rawText = text;
    resume.status = "parsed";
    
    await resume.save();

    // The Bridge: If a failed resume finally parses, create the candidate!
    await syncCandidateFromResume(resume);

    return res.status(200).json(new ApiResponse(200, resume, "Resume re-parsed successfully"));

  } catch (error) {
    console.error(`Retry Parsing Error for ${resumeId}:`, error.message);
    resume.status = "failed";
    await resume.save();
    throw new ApiError(500, `Re-parsing failed: ${error.message}`);
  }
});

/**
 * @desc    Shortlist a resume (and automatically advance candidate pipeline)
 * @route   PATCH /api/v1/resumes/:resumeId/shortlist
 */
export const shortlistResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  
  // 1. Prevent CastErrors by validating the ID format first
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, `Invalid Resume ID format: ${resumeId}`);
  }
  
  // Defensive fallback: If req.body is undefined, use an empty object
  const { isShortlisted = true } = req.body || {};

  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError(404, "Resume not found");

  // The Bridge: Push the candidate to the screening stage in the ATS Pipeline
  if (isShortlisted) {
    const candidate = await Candidate.findOne({ resumeId: resume._id });
    if (candidate && candidate.stage === "new") {
      candidate.stage = "screening";
      
      // Keep an audit trail of the stage movement
      candidate.stageHistory.push({
        stage: "screening",
        note: "Candidate shortlisted directly from resume view",
        changedBy: req.user?._id || null,
        changedAt: new Date()
      });
      
      await candidate.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(200, resume, `Resume ${isShortlisted ? 'shortlisted' : 'removed from shortlist'} successfully`)
  );
});

/**
 * @desc    Parse plain text payload
 * @route   POST /api/v1/resumes/parse-text
 */
export async function parsePlainTextHandler(req, res) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ success: false, error: "text (string) is required in body" });
    }

    const cleanedText = text.replace(/\r\n/g, "\n").replace(/\n{2,}/g, "\n\n").trim();

    return res.json({ success: true, parsed: { text: cleanedText } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to parse text" });
  }
}

/**
 * @desc    Delete a resume record and its associated file
 * @route   DELETE /api/v1/resumes/:resumeId
 */
export const deleteResume = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;

  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError(404, "Resume not found");

  // 1. Storage Cleanup
  try {
    if (resume.fileUrl.includes('amazonaws.com')) {
      // await s3Client.send(...) 
    } else {
      const localPath = resume.fileUrl.split(`${req.get('host')}/`)[1];
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
  } catch (err) {
    console.error("Storage cleanup failed:", err.message);
  }

  // 2. Database Cleanup - IMPORTANT: Wipe out the bridged Candidate!
  await Candidate.deleteMany({ resumeId: resume._id });
  await Resume.findByIdAndDelete(resumeId);

  res.status(200).json(new ApiResponse(200, null, "Resume and associated candidate deleted successfully"));
});