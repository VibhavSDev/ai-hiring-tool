import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { getOrCreateEmbedding } from "../services/embedding.service.js";

/**
 * @desc    Generate a single embedding
 * @route   POST /api/embeddings
 */
export const getEmbeddingHandler = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string" || text.trim().length < 10) {
    throw new ApiError(400, "text must be a non-empty string (min 10 chars)");
  }

  const embedding = await getOrCreateEmbedding(text);

  return res.status(200).json(
    new ApiResponse(200, {
      key: embedding.key,
      dim: embedding.dim,
      cached: embedding.cached,
      sample: embedding.embedding.slice(0, 16), // safe preview
    }, "Embedding generated successfully")
  );
});

/**
 * @desc    Generate bulk embeddings
 * @route   POST /api/embeddings/bulk
 */
export const getBulkEmbeddingsHandler = asyncHandler(async (req, res) => {
  const { texts } = req.body;

  if (!Array.isArray(texts) || texts.length === 0) {
    throw new ApiError(400, "texts must be a non-empty array of strings");
  }

  const results = await Promise.all(
    texts.map(async (text) => {
      if (typeof text !== "string" || text.trim().length < 10) {
        return { error: "invalid or short text" };
      }
      try {
        const emb = await getOrCreateEmbedding(text);
        return { key: emb.key, dim: emb.dim, cached: emb.cached };
      } catch (err) {
        return { error: "embedding failed" };
      }
    })
  );

  return res.status(200).json(
    new ApiResponse(200, { results }, "Bulk embeddings processed")
  );
});