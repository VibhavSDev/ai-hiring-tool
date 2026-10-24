import { Candidate } from "../models/candidate.model.js";
import { Resume } from "../models/resume.model.js";
import { parseResumeWithAI } from "./gemini.service.js";

/**
 * Helper Function: The Bridge Builder
 * Safely creates or updates the Candidate record when a Resume is parsed successfully.
 */
export async function syncCandidateFromResume(parsedResume) {
  // 1. Remove jobId from strict requirement to support the "General Pool"
    if (!parsedResume?.name || !parsedResume?.email) return;

    const normalizedEmail = String(parsedResume.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return; // Ensure valid email

    // 2. Search Strategy: 
    // - Try matching by resumeId first (handles single-candidate uploads)
    // - Fallback to matching by email AND jobId (handles duplicate bulk uploads)
    let candidate = await Candidate.findOne({
    $or: [
        { resumeId: parsedResume._id },
        { email: normalizedEmail, jobId: parsedResume.jobId || null }
    ]
    });

    if (!candidate) {
    // 3. Create a Brand New Unified Candidate Record (Bulk Upload Scenario)
    await Candidate.create({
        jobId: parsedResume.jobId || undefined, // undefined prevents MongoDB CastErrors if null
        name: parsedResume.name,
        email: normalizedEmail,
        phone: parsedResume.phone || "",
        source: "upload",
        stage: "new",
        summary: parsedResume.summary || "",
        notes: `Auto-created from uploaded resume ${parsedResume.fileKey}`,
        resumeId: parsedResume._id,
        stageHistory: [{
        stage: "new",
        note: "Candidate created automatically from resume upload",
        changedBy: parsedResume.uploadedBy,
        changedAt: new Date(),
        }],
        scoring: { overallScore: 0 } // Ready for AI evaluation
    });
    } else {
    // 4. Update existing Candidate Record (Manual Candidate / Single Upload Scenario)
    candidate.resumeId = parsedResume._id;

    // Enrich missing fields with AI-parsed data without overwriting recruiter edits
    if (!candidate.name || candidate.name === "extracting...") {
        candidate.name = parsedResume.name;
    }
    if (!candidate.phone && parsedResume.phone) {
        candidate.phone = parsedResume.phone;
    }
    if (!candidate.summary && parsedResume.summary) {
        candidate.summary = parsedResume.summary;
    }

    await candidate.save();
    }
}

/**
 * Background AI Logic
 */
export async function processResumeAI(resumeId, rawText, fileName) {
    try {
    const aiData = await parseResumeWithAI(rawText);

    const parsedResume = await Resume.findByIdAndUpdate(
        resumeId,
        {
            status: "parsed",
            name: aiData.name,
            email: aiData.email,
            phone: aiData.phone,
            skills: aiData.skills,
            experienceYears: aiData.experience_years,
            parseConfidence: aiData.confidence,
            summary: aiData.summary || ""
        },
        { new: true }
    );

    // Call the newly extracted bridge logic!
    await syncCandidateFromResume(parsedResume);

    } catch (err) {
    console.error(`⚠️ AI Task Error [${fileName}]:`, err.message);
    await Resume.findByIdAndUpdate(resumeId, { status: "failed" });
    }
}