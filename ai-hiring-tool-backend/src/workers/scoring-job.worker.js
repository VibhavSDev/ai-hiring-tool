import { Worker } from "bullmq";
import IORedis from "ioredis";
import { ScoringJob } from "../models/scoring-job.model.js";
import { Candidate } from "../models/candidate.model.js"; // The new unified model!
import { Job } from "../models/job.model.js";
import { rankResumes } from "../services/ranking.service.js";
import { getIO } from "../utils/socket.js";

const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

const scoringWorker = new Worker(
  "scoring-queue",
  async (bullJob) => {
    const { scoringJobId } = bullJob.data;
    const scoringJob = await ScoringJob.findById(scoringJobId);
    
    if (!scoringJob || ["completed", "failed", "cancelled"].includes(scoringJob.status)) return;

    try {
      const job = await Job.findById(scoringJob.jobId).lean();
      if (!job) throw new Error("Job context missing");

      // 1. Fetch UN-SCORED Candidates and populate their Resumes
      const candidatesToScore = await Candidate.find({ 
        jobId: job._id, 
        resumeId: { $exists: true, $ne: null },
        "scoring.overallScore": 0 // Only score those who haven't been scored yet
      }).populate("resumeId").lean();

      if (!candidatesToScore.length) {
        throw new Error("No unscored candidates found for this job");
      }

      // Extract just the resume objects to pass into your existing rankResumes service
      const resumesToScore = candidatesToScore.map(c => c.resumeId);

      // 2. Update to Processing
      scoringJob.status = "processing";
      scoringJob.startedAt = new Date();
      scoringJob.progress = { total: candidatesToScore.length, processed: 0 };
      await scoringJob.save();

      // 3. Execute Ranking Engine
      const rankedResults = await rankResumes({
        job,
        resumes: resumesToScore,
        jdEmbedding: job.embedding,
        weights: job.defaultWeights || { skill: 0.5, experience: 0.3, semantic: 0.2 },
        onProgress: async (processed, lastCandidateName) => {
          await ScoringJob.updateOne(
            { _id: scoringJob._id },
            { $set: { "progress.processed": processed, latestProcessedName: lastCandidateName } }
          );

          const io = getIO();
          if (io) {
            io.to(`job:${job._id}`).emit("scoring-progress", {
              processed: processed,
              total: candidatesToScore.length,
              latestProcessedName: lastCandidateName
            });
          }
        },
        shouldCancel: async () => {
          // If you implement cancellation later, you can check it here
          return false;
        },
      });

      // 4. Build Bulk Write Operations for the Candidate Model
      const candidateSyncOps = rankedResults.map((r) => {
        // Match the result back to the specific candidate using the resumeId
        const matchingCandidate = candidatesToScore.find(
          c => c.resumeId._id.toString() === r.resumeId.toString()
        );

        return {
          updateOne: {
            filter: { _id: matchingCandidate._id },
            update: {
              $set: {
                "scoring.overallScore": r.finalScore,
                "scoring.skillMatchScore": r.scores.skill?.percent || 0,
                "scoring.experienceScore": r.scores.experience?.percent || 0,
                "scoring.semanticScore": r.scores.semantic?.percent || 0,
                "scoring.matchedSkills": r.signals?.matchedSkills || [],
                "scoring.missingSkills": r.signals?.missingSkills || [],
                "scoring.recommendation": r.explanation?.recommendation || "pending",
                "scoring.aiSummary": r.explanation?.summary || "",
                "scoring.lastScoredAt": new Date()
              }
            }
          }
        };
      });

      // 5. Execute the single DB operation
      if (candidateSyncOps.length > 0) {
        await Candidate.bulkWrite(candidateSyncOps);
      }

      // 6. Finalize
      scoringJob.status = "completed";
      scoringJob.finishedAt = new Date();
      scoringJob.latestProcessedName = "Ranking Complete";
      await scoringJob.save();

    } catch (err) {
      console.error(`Worker Error [${scoringJobId}]:`, err.message);
      scoringJob.status = err.message === "JOB_CANCELLED" ? "cancelled" : "failed";
      // We don't save the full stack trace to the DB anymore to keep it lightweight, just the message
      scoringJob.finishedAt = new Date();
      await scoringJob.save();
      throw err; 
    }
  },
  { connection, concurrency: 2 }
);

scoringWorker.on('ready', () => {
  console.log("✅ Worker is connected and listening for jobs!");
});

scoringWorker.on('active', (job) => {
  console.log(`🏃 Job ${job.id} has started processing`);
});

scoringWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});