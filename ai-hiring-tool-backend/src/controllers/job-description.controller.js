import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { parseJobDescription } from "../services/gemini.service.js";

/**
 * @desc    Parse raw job description text into structured JSON
 * @route   POST /api/jd/parse
 */
export const parseJDHandler = asyncHandler(async (req, res) => {
  const { jdText } = req.body;

  if (typeof jdText !== "string" || jdText.trim().length < 20) {
    throw new ApiError(400, "jdText must be a valid string (min 20 chars)");
  }

  const parsedJD = await parseJobDescription(jdText);

  return res.status(200).json(
    new ApiResponse(200, { parsedJD }, "Job description parsed successfully")
  );
});