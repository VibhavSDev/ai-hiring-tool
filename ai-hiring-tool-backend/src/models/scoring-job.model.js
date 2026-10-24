import mongoose from "mongoose";

const ScoringJobSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    status: {
        type: String,
        enum: ["queued", "processing", "completed", "failed"],
        default: "queued",
        index: true,
    },

    // 📈 Progress tracking for the UI Modal
    progress: {
        total: { type: Number, default: 0 },     // e.g., 50 candidates
        processed: { type: Number, default: 0 }, // e.g., 12 done so far
    },

    latestProcessedName: { type: String, default: "" },
    errorCount: { type: Number, default: 0 },

    startedAt: Date,
    finishedAt: Date,
}, { timestamps: true }); 

export const ScoringJob = mongoose.model("ScoringJob", ScoringJobSchema);