/**
 * Build a deterministic explanation for a candidate score.
 */
export function explanationEngine({ scores, finalScore }) {
  const strengths = [];
  const concerns = [];

  // 1. Skill Signals (Now properly reading from signals object)
  const { percent: skillPct, signals: skillSignals } = scores.skill;
  const matched = skillSignals?.matched || [];
  const missing = skillSignals?.missing || [];

  if (skillPct >= 80) {
    strengths.push(`Expert skill alignment: matched ${matched.length} key requirements.`);
  } else if (skillPct >= 50) {
    strengths.push(`Core competencies found: ${matched.slice(0, 3).join(", ")}.`);
    if (missing.length > 0) {
      concerns.push(`Missing specific technical depth in: ${missing.slice(0, 2).join(", ")}.`);
    }
  } else {
    concerns.push(`Critical technical gaps: lacks ${missing.length} required skills.`);
  }

  // 2. Experience Signals
  const expPct = scores.experience.percent;
  if (expPct >= 100) {
    strengths.push("Seniority level exceeds minimum requirements for this position.");
  } else if (expPct >= 80) {
    strengths.push("Professional tenure is well-aligned with the role expectations.");
  } else {
    concerns.push("Years of relevant experience are below the desired threshold.");
  }

  // 3. Semantic Alignment
  const semPct = scores.semantic.percent;
  if (semPct >= 85) {
    strengths.push("Strong contextual relevance between past projects and current JD.");
  } else if (semPct < 60) {
    concerns.push("Low semantic overlap; past roles may not be directly transferable.");
  }

  return {
    summary: buildSummary(finalScore),
    strengths,
    concerns,
    recommendation: buildRecommendation(finalScore),
    generatedAt: new Date().toISOString(),
    raw: { skillPct, expPct, semPct }
  };
}

function buildSummary(score) {
  if (score >= 85) return "Exceptional candidate with near-perfect alignment across all scoring vectors.";
  if (score >= 70) return "Qualified applicant demonstrating the core competencies required for success.";
  if (score >= 50) return "Average match; candidate possesses some required traits but lacks total role coverage.";
  return "Weak match; significant misalignment with core job requirements.";
}

function buildRecommendation(score) {
  if (score >= 85) return "strong_yes";
  if (score >= 70) return "yes";
  if (score >= 50) return "maybe";
  return "no";
}