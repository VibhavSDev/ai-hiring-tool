export async function experienceEngine(job, resume) {
  const jdMinYears = Number(job?.parsed?.min_experience_years || 0);
  const resumeYears = Number(resume?.experienceYears || 0);

  // 1. Fallback for missing data
  if (jdMinYears === 0) {
    return {
      percent: 100, // If job requires 0 years, everyone is a 100% match
      rawScore: 1,
      confidence: "high",
      signals: { reason: "No experience required for this role" },
    };
  }

  if (resumeYears === 0 && jdMinYears > 0) {
    return {
      percent: 0,
      rawScore: 0,
      confidence: "high",
      signals: { resumeYears, jdMinYears, gap: -jdMinYears },
    };
  }

  // 2. Calculation Logic
  let percent = 0;
  
  if (resumeYears >= jdMinYears) {
    // Candidate meets or exceeds requirements
    // We give 100%, but you could technically give 110% if you want to reward seniority
    percent = 100; 
  } else {
    // Candidate is below requirements
    // Use a non-linear penalty: a 1-year gap at 10 years is less severe than at 2 years
    const gapRatio = resumeYears / jdMinYears;
    
    if (gapRatio >= 0.8) {
      percent = 85; // Very close (e.g., 4 years for a 5-year role)
    } else if (gapRatio >= 0.5) {
      percent = 60; // Moderate gap
    } else {
      percent = Math.round(gapRatio * 100); // Significant gap
    }
  }

  return {
    percent,
    rawScore: resumeYears / jdMinYears,
    confidence: resumeYears >= jdMinYears ? "high" : "medium",
    signals: {
      resumeYears,
      jdMinYears,
      gap: resumeYears - jdMinYears,
      isOverqualified: resumeYears > jdMinYears + 5 // Flag if candidate has 5+ years over requirement
    },
  };
}