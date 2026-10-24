import { pipeline } from "@xenova/transformers";

// Use a Promise to prevent race conditions during concurrent initialization
let extractorPromise = null;

/**
 * Initializes the Xenova pipeline safely as a singleton
 */
async function getExtractor() {
  if (!extractorPromise) {
    console.log("🤖 Initializing local Xenova embedding model...");
    extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    });
  }
  return extractorPromise;
}

/**
 * Local semantic embedding (384 dims)
 * BEST FOR: Semantic matching (e.g., "Developer" matching "Engineer")
 */
export async function localGetEmbedding(text) {
  try {
    const extractor = await getExtractor();

    // Resumes can be long. We truncate to ~2000 chars to stay within 
    // the 512-token limit of MiniLM-L6-v2 without crashing the tokenizer.
    const safeText = text.substring(0, 2000); 

    const output = await extractor(safeText, {
      pooling: "mean",
      normalize: true, // Crucial for cosine similarity
    });

    return Array.from(output.data);
  } catch (error) {
    console.error("Local Embedding Provider Error:", error);
    throw new Error("Failed to generate local embeddings.");
  }
}