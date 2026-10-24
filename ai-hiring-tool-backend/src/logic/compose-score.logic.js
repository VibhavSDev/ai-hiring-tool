/**
 * Combines scores from different engines into a single normalized result.
 * @param {Object} scores - The result objects from the three engines
 * @param {Object} weights - The normalized weights to apply
 */
export function composeScore({ semanticScore, skillScore, experienceScore }, finalWeights) {
    // 1. Extract percentages (Safety check for 0)
    const sem = semanticScore?.percent || 0;
    const ski = skillScore?.percent || 0;
    const exp = experienceScore?.percent || 0;

    // 2. Apply Weights
    const final =
        (sem * finalWeights.semantic) +
        (ski * finalWeights.skill) +
        (exp * finalWeights.experience);

    // 3. Return the rounded final score
    return {
        overall: Math.min(100, Math.max(0, Math.round(final))),
        breakdown: {
            semanticWeight: finalWeights.semantic,
            skillWeight: finalWeights.skill,
            experienceWeight: finalWeights.experience
        }
    };
}