export function normalizeVector(vec) {
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return vec.map(v => v / (norm || 1));
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    mA += a[i] * a[i];
    mB += b[i] * b[i];
  }

  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);

  if (mA === 0 || mB === 0) return 0;

  return dotProduct / (mA * mB);
}

/**
 * Normalize cosine similarity → scoring scale
 */
export function normalizeScore(similarity) {
  const clamped = Math.max(-1, Math.min(1, similarity));

  return {
    raw: clamped,
    percentLinear: Math.round(((clamped + 1) / 2) * 10000) / 100,
    percent: Math.max(0, Math.round(clamped * 100)),
  };
}

