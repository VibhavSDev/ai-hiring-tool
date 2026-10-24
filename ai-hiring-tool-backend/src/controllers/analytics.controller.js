import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Job } from "../models/job.model.js";
import { Candidate } from "../models/candidate.model.js";

/**
 * @desc    Get dashboard metrics for the current user
 * @route   GET /api/v1/analytics/dashboard
 * @access  Private
 */
export const getDashboardSummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Get basic Job KPIs scoped strictly to this user
    const totalJobs = await Job.countDocuments({ createdBy: userId });

    // Note: Using lowercase 'active' to match our Job model schema enum
    const activeJobs = await Job.countDocuments({ 
        createdBy: userId, 
        status: { $in: ["active", "published"] } 
    });

    // 2. Fetch the user's Job IDs to correctly filter Candidate aggregation
    const userJobs = await Job.find({ createdBy: userId }).select('_id');
    const userJobIds = userJobs.map(job => job._id);

    // 3. Aggregate candidates by stage for this user's jobs only
    const pipelineAggregation = await Candidate.aggregate([
        { $match: { jobId: { $in: userJobIds } } },
        {
            $group: {
            _id: "$stage",
            count: { $sum: 1 }
            }
        }
    ]);

    // Initialize default pipeline map
    const pipelineMap = {
        new: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0
    };

    // Populate the map
    let totalCandidates = 0;
    pipelineAggregation.forEach(stage => {
        const stageName = stage._id || "new";
        pipelineMap[stageName] = stage.count;
        totalCandidates += stage.count;
    });

    // 4. Fetch recent jobs for the quick-access panel
    const recentJobs = await Job.find({ createdBy: userId })
                                .sort({ createdAt: -1 })
                                .limit(4)
                                .select("title department status createdAt");

    return res.status(200).json(
    new ApiResponse(200, {
        kpis: {
            activeJobs: activeJobs || totalJobs,
            totalCandidates,
            activeInterviews: pipelineMap.interview || 0,
            totalHires: pipelineMap.hired || 0,
        },
        pipeline: pipelineMap,
        recentJobs
    }, "Dashboard analytics retrieved successfully")
    );
});