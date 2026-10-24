import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { Resume } from "../models/resume.model.js";
import { getOrCreateEmbedding } from "../services/embedding.service.js";

/**
 * @desc    Force refresh a resume's vector embedding
 * @route   POST /api/v1/resumes/:resumeId/embed
 */
export const refreshResumeEmbeddingHandler = asyncHandler(async (req, res) => {
  const { resumeId } = req.params;
  
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError(404, "Resume not found");

  // THE FIX: Use rawText as the fallback instead of 'text' based on our new schema
  const text = resume.parsedText || resume.rawText;
  if (!text) throw new ApiError(400, "Resume has no text to embed");

  const emb = await getOrCreateEmbedding(text, { meta: { source: "refresh-endpoint" } });

  resume.embeddingKey = emb.key;
  resume.embeddingDim = emb.dim;
  resume.embedding = emb.embedding;
  await resume.save();

  return res.status(200).json(
    new ApiResponse(200, {
      resumeId: resume._id, 
      embeddingKey: emb.key, 
      cached: emb.cached 
    }, "Resume embedding refreshed successfully")
  );
});