import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    default: "General",
  },
  status: {
    type: String,
    enum: ["active", "archived", "draft"],
    default: "active",
    index: true,
  },
  rawText: {
    type: String,
    required: true,
  },
  parsed: {
    skills_required: [String],
    experience_required: String,
    responsibilities: [String],
    seniority: String,
    location: String, // Added from UI metadata
    employment_type: String // Added from UI metadata
  },

  // Embedding/cache
  embedding: {
    type: [Number],
    default: []
  },
  embeddingKey: {
    type: String,
    index: true
  },
  embeddingDim: Number,
}, { timestamps: true });

export const Job = mongoose.model("Job", JobSchema);
