export const DEFAULT_SCORING_WEIGHTS = {
  skill: 0.4,       // 40% - Focus on technical competence
  experience: 0.25, // 25% - Focus on seniority
  semantic: 0.35,   // 35% - Focus on "vibe" and context match
};

/**
 * Ensures weights always sum to 1.0 to prevent score inflation.
 */
export function normalizeWeights(weights = DEFAULT_SCORING_WEIGHTS) {
  const normalized = { ...DEFAULT_SCORING_WEIGHTS, ...weights };
  const total = Object.values(normalized).reduce((a, b) => a + b, 0);
  
  if (total === 0) return DEFAULT_SCORING_WEIGHTS;

  return Object.fromEntries(
    Object.entries(normalized).map(([k, v]) => [k, v / total])
  );
}