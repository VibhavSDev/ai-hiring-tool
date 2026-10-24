import { normalizeScore, cosineSimilarity } from "../utils/vector.js";
import { getOrCreateEmbedding } from "./embedding.service.js";
import { explanationEngine } from "./ai-engines/explanation.engine.js";

/**
 * Build JD text for embedding in a deterministic way
 */
function buildJDText(parsedJD, rawJD) {
  if (parsedJD && typeof parsedJD === "object") {
    return [
      parsedJD.title,
      parsedJD.job_summary,
      Array.isArray(parsedJD.skills_required) ? parsedJD.skills_required.join(", ") : null,
      Array.isArray(parsedJD.keywords) ? parsedJD.keywords.join(", ") : null,
    ].filter(Boolean).join(". ");
  }
  return rawJD || "";
}

function normalizeSkill(skill) {
  return skill.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function compareSkills(jdSkills = [], resumeSkills = []) {
  const resumeSet = new Set(resumeSkills.map(normalizeSkill));
  const matched = [];
  const missing = [];

  for (const skill of jdSkills) {
    if (resumeSet.has(normalizeSkill(skill))) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }
  return { matched, missing };
}

/**
 * Score a single resume statelessly (Great for UI previews)
 */
export async function scoreSingleResume(payload) {
  const { jdParsedJSON, jdText, resumeText, resumeSkills = [], weights } = payload;

  if ((!jdParsedJSON && !jdText) || !resumeText) {
    throw new Error("JD and resume text are required for scoring");
  }

  const lockedWeights = {
    semantic: Number(weights?.semantic ?? 0.7),
    skills: Number(weights?.skills ?? 0.3),
  };

  const jdEmbeddingText = buildJDText(jdParsedJSON, jdText);

  // FIXED: Extract the actual '.embedding' array from the service response
  const [jdEmbResult, resumeEmbResult] = await Promise.all([
    getOrCreateEmbedding(jdEmbeddingText),
    getOrCreateEmbedding(resumeText),
  ]);

  const jdVector = jdEmbResult.embedding;
  const resumeVector = resumeEmbResult.embedding;

  const similarity = cosineSimilarity(jdVector, resumeVector);
  const semanticScore = normalizeScore(similarity);

  const jdSkills = jdParsedJSON?.skills_required || [];
  const { matched, missing } = compareSkills(jdSkills, resumeSkills);
  
  const skillScoreRaw = jdSkills.length === 0 ? 1 : matched.length / jdSkills.length;
  const skillScore = normalizeScore(skillScoreRaw);

  const overallScore = Math.round(
    (semanticScore.percent * lockedWeights.semantic) + 
    (skillScore.percent * lockedWeights.skills)
  );

  // Generate Human-Readable Explanation
  const explanation = explanationEngine({
    scores: {
      skill: { percent: skillScore.percent, signals: { matched, missing } },
      semantic: { percent: semanticScore.percent },
      experience: { percent: 100 }, // Passed default to prevent engine errors for single-score
    },
    finalScore: overallScore,
  });

  return {
    scores: {
      overall: overallScore,
      semantic: semanticScore.percent,
      skills: skillScore.percent,
    },
    signals: {
      matchedSkills: matched,
      missingSkills: missing,
    },
    explanation
  };
}