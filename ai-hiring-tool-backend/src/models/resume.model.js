import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: false, index: true },

  status: { 
    type: String, 
    enum: ["uploaded", "processing", "parsed", "failed"], // Removed 'scored'
    default: "uploaded", 
    index: true 
  },

  name: String,
  email: { type: String, index: true },
  phone: String,
  source: { type: String, enum: ["pdf", "linkedin", "text"], required: true },

  // Parsed Content
  rawText: { type: String, required: true },
  parsedText: String,
  skills: [String],
  experienceYears: Number,
  parseConfidence: { type: Number, min: 0, max: 100 },

  // File Storage
  fileUrl: { type: String, required: true }, 
  fileKey: { type: String, required: true }, 

  // AI Embeddings
  embeddingKey: { type: String, index: true },
  embeddingDim: Number,
  embedding: { type: [Number], default: [] },

}, { timestamps: true });

export const Resume = mongoose.model("Resume", ResumeSchema);