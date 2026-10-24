import { Resume } from "../models/resume.model.js";
import { normalizeWeights } from "../constants/scoring-config.js";
import { getOrCreateEmbedding } from "./embedding.service.js";
import { skillEngine } from "./ai-engines/skill.engine.js";
import { experienceEngine } from "./ai-engines/experience.engine.js";
import { semanticEngine } from "./ai-engines/semantic.engine.js";
import { composeScore } from "../logic/compose-score.logic.js";
import { explanationEngine } from "./ai-engines/explanation.engine.js";
import { generateAIExplanation } from "./ai-explanation.service.js";

export async function rankResumes({
  job,
  resumes,
  jdEmbedding,
  topN = 100,
  weights,
  onProgress,
  shouldCancel,
}) {
  const finalWeights = normalizeWeights(weights);
  const totalResumes = resumes.length;
  
  const CONCURRENCY_LIMIT = 3; 
  const results = [];
  let processedCount = 0;

  for (let i = 0; i < totalResumes; i += CONCURRENCY_LIMIT) {
    if (await shouldCancel?.()) throw new Error("JOB_CANCELLED");

    const chunk = resumes.slice(i, i + CONCURRENCY_LIMIT);
    
    const chunkResults = await Promise.all(chunk.map(async (resume) => {
      try {
        const resumeEmbedding = await ensureResumeEmbedding(resume);

        const [skillScore, experienceScore, semanticScore] = await Promise.all([
          skillEngine(job, resume),
          experienceEngine(job, resume),
          semanticEngine(jdEmbedding, resumeEmbedding)
        ]);

        const finalScoreData = composeScore(
          { skillScore, experienceScore, semanticScore },
          finalWeights
        );

        const explanation = explanationEngine({
          scores: { skill: skillScore, experience: experienceScore, semantic: semanticScore },
          finalScore: finalScoreData.overall,
        });

        if (process.env.ENABLE_AI_EXPLANATIONS === "true") {
          explanation.aiNarrative = await generateAIExplanation(explanation).catch(() => null);
        }

        return {
          resumeId: resume._id,
          name: resume.name, 
          scores: {
            skill: { percent: skillScore.percent },
            experience: { percent: experienceScore.percent },
            semantic: { percent: semanticScore.percent },
          },
          finalScore: finalScoreData.overall,
          signals: {
            matchedSkills: skillScore.signals?.matched || [], // FIXED mapped property
            missingSkills: skillScore.signals?.missing || [], // FIXED mapped property
          },
          explanation: {
            summary: explanation.summary,
            strengths: explanation.strengths,
            concerns: explanation.concerns,
            recommendation: explanation.recommendation,
            aiText: explanation.aiNarrative
          },
        };
      } catch (err) {
        console.error(`Failed to score resume ${resume._id}:`, err);
        return { resumeId: resume._id, error: "SCORING_FAILED" };
      }
    }));

    results.push(...chunkResults);
    processedCount += chunk.length;

    if (onProgress) {
      const lastCandidate = chunkResults[chunkResults.length - 1];
      await onProgress(processedCount, lastCandidate?.name || "Candidate");
    }
  }

  return results
    .filter(r => !r.error)
    .sort((a, b) => b.finalScore - a.finalScore || a.resumeId.toString().localeCompare(b.resumeId.toString()))
    .slice(0, topN);
}

async function ensureResumeEmbedding(resume) {
  if (resume.embedding && resume.embedding.length > 0) {
    return resume.embedding;
  }

  const textToEmbed = resume.parsedText || resume.rawText || "";
  if (!textToEmbed) throw new Error("No text available for embedding");

  const emb = await getOrCreateEmbedding(textToEmbed);
  
  await Resume.updateOne(
    { _id: resume._id },
    {
      $set: {
        embedding: emb.embedding,
        embeddingDim: emb.dim,
        embeddingKey: emb.key,
      }
    }
  );

  return emb.embedding;
}