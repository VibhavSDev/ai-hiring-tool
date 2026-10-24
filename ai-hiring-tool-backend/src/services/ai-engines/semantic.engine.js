import { cosineSimilarity } from "../../utils/vector.js";

export async function semanticEngine(jdEmbedding, resumeEmbedding) {
  // 1. Guard Clause
  if (
    !Array.isArray(jdEmbedding) || 
    !Array.isArray(resumeEmbedding) || 
    jdEmbedding.length !== resumeEmbedding.length
  ) {
    console.error(`🚨 Dimension Mismatch: JD(${jdEmbedding.length}) vs Resume(${resumeEmbedding.length})`);
    return {
      percent: 0,
      rawScore: 0,
      confidence: "low",
      signals: { error: "Incompatible embedding versions. Please re-parse." },
    };
  }

  const similarity = cosineSimilarity(jdEmbedding, resumeEmbedding);

  /**
   * 2. Advanced Normalization
   * Instead of a pure linear (sim + 1) / 2, we use a "Human-Perceived" scale.
   * For LLM vectors:
   * > 0.85 is an excellent match.
   * < 0.70 is usually irrelevant.
   */
  let percent = 0;
  if (similarity > 0.9) percent = 100;
  else if (similarity > 0.7) {
    // Map 0.7 -> 0.9 range to 40% -> 95% for better UI differentiation
    percent = Math.round(((similarity - 0.7) / (0.9 - 0.7)) * 55 + 40);
  } else {
    percent = Math.round(similarity * 50); // Low relevance
  }

  return {
    percent: Math.min(100, Math.max(0, percent)),
    rawScore: similarity,
    confidence: similarity > 0.8 ? "high" : "medium",
    signals: {
      similarity: similarity.toFixed(4),
      embeddingDim: jdEmbedding.length,
    },
  };
}