/**
 * Normalizes strings by removing versioning, special chars, and extra whitespace.
 * Example: "React.js V18" -> "reactjs"
 */
const normalizeSkill = (s) => 
  s?.toLowerCase()
   .replace(/[\s\.\-\/]/g, "") 
   .replace(/v\d+$/, "") 
   .trim();

export async function skillEngine(job, resume) {
  const jdSkillsRaw = job?.parsed?.skills_required || [];
  const resumeSkillsRaw = resume?.skills || [];

  const jdSkills = jdSkillsRaw.map(normalizeSkill).filter(Boolean);
  const resumeSkills = resumeSkillsRaw.map(normalizeSkill).filter(Boolean);

  if (jdSkills.length === 0) {
    return {
      percent: 0,
      rawScore: 0,
      confidence: "low",
      signals: { reason: "No JD skills provided", matched: [], missing: [] },
    };
  }

  const resumeSet = new Set(resumeSkills);
  const matched = [];
  const missing = [];

  for (let i = 0; i < jdSkills.length; i++) {
    const skill = jdSkills[i];
    const originalName = jdSkillsRaw[i];

    if (resumeSet.has(skill)) {
      matched.push(originalName);
      continue;
    }

    const isFuzzyMatch = resumeSkills.some(rs => 
      rs.includes(skill) || skill.includes(rs)
    );

    if (isFuzzyMatch) {
      matched.push(originalName);
    } else {
      missing.push(originalName);
    }
  }

  const percent = Math.round((matched.length / jdSkills.length) * 100);

  return {
    percent,
    rawScore: percent / 100, // Added for consistency with other engines
    confidence: percent > 75 ? "high" : "medium",
    signals: {
      matched,
      missing,
      totalJD: jdSkills.length
    }
  };
}