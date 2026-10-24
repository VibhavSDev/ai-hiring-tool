import mongoose from "mongoose";

const CandidateSchema = new mongoose.Schema({
  // 🔗 The Bridge Links
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: false, index: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", index: true },
  
  // 👤 Identity (Copied from Resume for fast querying)
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: String,
  source: { type: String, enum: ["upload", "manual", "linkedin", "referral"], default: "upload" },

  // 🛤️ Pipeline Management (Merged from old Application model)
  stage: { 
    type: String, 
    enum: ["new", "screening", "interview", "offer", "hired", "rejected"], 
    default: "new", 
    index: true 
  },
  status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  notes: String,
  stageHistory: [{
    stage: String,
    note: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date, default: Date.now }
  }],

  // 🧠 AI Evaluation (Merged from old ScoringResult model)
  scoring: {
    overallScore: { type: Number, default: 0 },
    skillMatchScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    semanticScore: { type: Number, default: 0 },
    matchedSkills: [String],
    missingSkills: [String],
    recommendation: { 
      type: String, 
      enum: ["strong_yes", "yes", "maybe", "no", "pending"], 
      default: "pending" 
    },
    aiSummary: String,
    lastScoredAt: Date
  }
}, { timestamps: true });

// Prevent duplicate applications for the same job
CandidateSchema.index({ email: 1, jobId: 1 }, { unique: true });

export const Candidate = mongoose.model("Candidate", CandidateSchema);