import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { generateInterviewQuestions } from "../services/interview-question.service.js";

/**
 * @desc    Generate AI interview questions based on skill gaps
 * @route   POST /api/v1/interviews/generate
 * @access  Private
 */
export const interviewQuestionsHandler = asyncHandler(async (req, res) => {
  const {
    jobTitle,
    jobSkills,
    candidateSkills,
    missingSkills,
    experienceLevel,
  } = req.body;

  if (!jobTitle) {
    throw new ApiError(400, "jobTitle is required to generate interview questions.");
  }

  const questions = await generateInterviewQuestions({
    jobTitle,
    jobSkills,
    candidateSkills,
    missingSkills,
    experienceLevel,
  });

  return res.status(200).json(
    new ApiResponse(
      200, 
      { questions }, // Kept 'questions' key for frontend backward compatibility
      "Interview questions generated successfully."
    )
  );
});