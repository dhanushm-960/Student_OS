/**
 * Core utility for calculating recruiter match scores and soft GPA eligibility.
 */

export const calculateMatchScore = (profile, company) => {
  let score = 0;
  
  // 1. CGPA match (30%)
  const gpa = profile.gpa || 0;
  const gpaDiff = gpa - company.minGpa;
  let gpaScore = 0;
  let eligibilityTier = "below_bar";
  
  if (gpaDiff >= 0) {
    gpaScore = 30;
    eligibilityTier = "eligible";
  } else if (gpaDiff >= -0.5) {
    gpaScore = 15;
    eligibilityTier = "borderline";
  }

  // 2. Skills match (40%)
  let matchedSkills = [];
  let missingSkills = [];
  let skillMatchPercentage = 0;
  
  if (company.requiredSkills && company.requiredSkills.length > 0) {
    const studentSkillsLower = (profile.skills || []).map(s => s.toLowerCase());
    company.requiredSkills.forEach(s => {
      if (studentSkillsLower.includes(s.toLowerCase())) {
        matchedSkills.push(s);
      } else {
        missingSkills.push(s);
      }
    });
    skillMatchPercentage = (matchedSkills.length / company.requiredSkills.length) * 100;
    score += (skillMatchPercentage / 100) * 40;
  } else {
    score += 40;
    skillMatchPercentage = 100;
  }

  // 3. Preferred tech match (30%)
  let matchedTech = [];
  if (company.preferredTech && company.preferredTech.length > 0) {
    const studentTechLower = (profile.resumeDetails?.technologies || profile.resumeDetails?.technicalSkills || []).map(t => t.toLowerCase());
    company.preferredTech.forEach(t => {
      if (studentTechLower.includes(t.toLowerCase())) {
        matchedTech.push(t);
        if (!matchedSkills.includes(t)) matchedSkills.push(t);
      } else {
        if (!missingSkills.includes(t)) missingSkills.push(t);
      }
    });
    score += (matchedTech.length / company.preferredTech.length) * 30;
  } else {
    score += 30;
  }

  const totalMatchScore = Math.min(100, Math.round(gpaScore + score));
  
  // Filter suppression logic
  const isSuppressed = gpaDiff < -1.0 && skillMatchPercentage < 30;

  // Recommendation logic
  let recommendation = "Apply now!";
  if (missingSkills.length > 0) {
    recommendation = `Acquire ${missingSkills[0]} to increase match score.`;
  }
  
  if (eligibilityTier === "borderline") {
    recommendation = `Below typical GPA bar (${company.minGpa}), but skills match is strong \u2014 some recruiters waive GPA for strong technical fit.`;
  } else if (eligibilityTier === "below_bar") {
    recommendation = `GPA is well below cutoff (${company.minGpa}). Focus on drastically improving skills or increasing GPA to be considered.`;
  } else if (gpaScore === 0) {
    recommendation = `Increase GPA to meet the ${company.minGpa} cutoff.`;
  }

  return {
    totalMatchScore,
    eligibilityTier,
    isSuppressed,
    matchedSkills,
    missingSkills,
    recommendation
  };
};
