import { EmbeddingCache } from "../models/embedding-cache.model.js";
import { hashText } from "../utils/text-hash.js";
import { localGetEmbedding } from "../providers/local.provider.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MIN_TEXT_LENGTH = 10;

/**
 * Retrieves an embedding from cache or generates a new one.
 */
export async function getOrCreateEmbedding(text, options = { provider: 'xenova', dim: 384 }) {
  // 1. Sanitize & Validate
  const cleanText = text?.trim() || "";
  if (cleanText.length < MIN_TEXT_LENGTH) {
    throw new Error(`Text too short to embed effectively.`);
  }

  // 2. High-Speed Cache Lookup
  const key = hashText(cleanText);
  
  const cached = await EmbeddingCache.findOne({ 
    key, 
    provider: options.provider 
  }).lean();

  if (cached) {
    return { ...cached, cached: true };
  }

  // 3. Generation (Provider Switching Logic)
  let vector;
  let finalDim = options.dim;

  if (options.provider === 'xenova') {
    vector = await localGetEmbedding(cleanText);
  } else if (options.provider === 'gemini') {
    // gemini-2.5-flash is for text generation. For vectors, we use Google's embedding model
    const embModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embModel.embedContent(cleanText);
    vector = result.embedding.values;
    finalDim = vector.length; // Usually 768 for Gemini embeddings
  }

  // 4. Persistence
  const result = await EmbeddingCache.findOneAndUpdate(
    { key, provider: options.provider }, 
    {
      $setOnInsert: {
        key,
        embedding: vector,
        dim: finalDim,
        provider: options.provider,
        modelName: options.modelName || 'default',
        textSample: cleanText.substring(0, 100)
      }
    },
    { upsert: true, new: true, lean: true }
  );

  return { ...result, cached: false };
}