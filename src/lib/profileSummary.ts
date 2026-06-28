/**
 * Builds a comprehensive, AI-ready summary of every meaningful profile field.
 * Used for university matching, checker, roadmap, essays — anywhere the AI
 * must consider the FULL student picture, not just GPA and activities.
 */

interface DocumentAnalysis {
  type: string;
  result?: any;
}

const isFilled = (v: any) => v !== undefined && v !== null && String(v).trim() !== "" && String(v).trim() !== "0";

export const buildComprehensiveCV = (
  profile: any,
  analyses?: DocumentAnalysis[],
): string => {
  if (!profile) return "";

  const sections: string[] = [];

  // === ACADEMIC CORE ===
  const academic: string[] = [];
  if (isFilled(profile.gpa)) academic.push(`GPA: ${profile.gpa}`);
  if (isFilled(profile.testScores)) academic.push(`Standardized Tests: ${profile.testScores}`);
  if (isFilled(profile.courseRigor)) academic.push(`Course Rigor: ${profile.courseRigor}`);
  if (isFilled(profile.apIbCourses)) academic.push(`AP/IB Courses & Honors/Awards: ${profile.apIbCourses}`);
  if (isFilled(profile.aLevelGrades)) academic.push(`A-Level Grades: ${profile.aLevelGrades}`);
  if (isFilled(profile.predictedGrades)) academic.push(`Predicted Grades: ${profile.predictedGrades}`);
  if (isFilled(profile.gaokaoScore)) academic.push(`Gaokao Score: ${profile.gaokaoScore}`);
  if (isFilled(profile.nationalExamType)) academic.push(`National Exam (${profile.nationalExamType}): ${profile.nationalExamScore || "N/A"}`);
  if (isFilled(profile.baccalaureateScore)) academic.push(`Baccalaureate Score: ${profile.baccalaureateScore}`);
  if (academic.length) sections.push(`=== ACADEMIC PERFORMANCE ===\n${academic.join("\n")}`);

  // === EXTRACURRICULARS & LEADERSHIP ===
  const ec: string[] = [];
  if (isFilled(profile.extracurriculars)) ec.push(`Extracurricular Activities: ${profile.extracurriculars}`);
  if (isFilled(profile.athleticsStatus)) ec.push(`Athletics Level: ${profile.athleticsStatus}`);
  if (isFilled(profile.artsPortfolio)) ec.push(`Arts/Portfolio Level: ${profile.artsPortfolio}`);
  if (ec.length) sections.push(`=== EXTRACURRICULARS, LEADERSHIP & TALENT ===\n${ec.join("\n")}`);

  // === BACKGROUND EXPERIENCE (Research / Volunteer / Work) ===
  const bg: string[] = [];
  if (isFilled(profile.researchExperience)) bg.push(`Research Experience: ${profile.researchExperience}`);
  if (isFilled(profile.volunteerHours)) bg.push(`Volunteer / Community Service: ${profile.volunteerHours}`);
  if (isFilled(profile.workExperience)) bg.push(`Work Experience / Internships: ${profile.workExperience}`);
  if (bg.length) sections.push(`=== BACKGROUND EXPERIENCE ===\n${bg.join("\n")}`);

  // === CONTEXT & DEMOGRAPHICS ===
  const ctx: string[] = [];
  if (isFilled(profile.geographicLocation)) ctx.push(`Geographic Location: ${profile.geographicLocation}`);
  if (isFilled(profile.firstGenStatus)) ctx.push(`First-Generation Status: ${profile.firstGenStatus}`);
  if (isFilled(profile.legacyStatus)) ctx.push(`Legacy Status: ${profile.legacyStatus}`);
  if (profile.personalContext) {
    const pc = profile.personalContext;
    const pcParts: string[] = [];
    if (isFilled(pc.personalStatement)) pcParts.push(`Personal Statement: ${pc.personalStatement}`);
    if (isFilled(pc.familyHardship)) pcParts.push(`Family Hardship: ${pc.familyHardship}`);
    if (isFilled(pc.financialChallenges)) pcParts.push(`Financial Challenges: ${pc.financialChallenges}`);
    if (isFilled(pc.healthChallenges)) pcParts.push(`Health Challenges: ${pc.healthChallenges}`);
    if (pcParts.length) ctx.push(pcParts.join("\n"));
  }
  if (ctx.length) sections.push(`=== PERSONAL CONTEXT & BACKGROUND ===\n${ctx.join("\n")}`);

  // === APPLICATION STRENGTH ===
  const app: string[] = [];
  if (isFilled(profile.essayStrength)) app.push(`Essay Strength: ${profile.essayStrength}`);
  if (isFilled(profile.recommendationStrength)) app.push(`Letters of Recommendation Strength: ${profile.recommendationStrength}`);
  if (isFilled(profile.demonstratedInterest)) app.push(`Demonstrated Interest: ${profile.demonstratedInterest}`);
  if (app.length) sections.push(`=== APPLICATION STRENGTH ===\n${app.join("\n")}`);

  // === GOALS ===
  const goals: string[] = [];
  if (isFilled(profile.intendedMajor)) goals.push(`Intended Major: ${profile.intendedMajor}`);
  if (Array.isArray(profile.preferredCountries) && profile.preferredCountries.length) {
    goals.push(`Preferred Study Destinations: ${profile.preferredCountries.join(", ")}`);
  }
  if (isFilled(profile.budget)) goals.push(`Budget: ${profile.budget}`);
  if (isFilled(profile.timeline)) goals.push(`Application Timeline: ${profile.timeline}`);
  if (goals.length) sections.push(`=== GOALS & PREFERENCES ===\n${goals.join("\n")}`);

  // === DOCUMENT-VERIFIED EVIDENCE ===
  // Normalize every score to a 0-100 scale so the AI compares them consistently.
  const to100 = (v: any): number | undefined => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return n <= 10 ? Math.round(n * 10) : Math.round(n);
  };
  if (analyses && analyses.length > 0) {
    const docs: string[] = [];
    for (const a of analyses) {
      if (!a.result) continue;
      const r = a.result;
      const summary = r.summary || r.overallAssessment || r.profileSummary || "";
      const raw =
        r.impactScore ??              // recommendation (0-100)
        r.academicStrengthScore ??    // transcript    (0-100)
        r.overallImpactScore ??       // awards / portfolio (0-100)
        r.overallRating ??            // 1-10 fallback
        r.strengthRating ??           // 1-10 fallback
        r.score;
      const score = to100(raw);
      const label = a.type.charAt(0).toUpperCase() + a.type.slice(1);
      docs.push(`${label}${score ? ` (Verified Rating: ${score}/100)` : ""}: ${summary}`.trim());
    }
    if (docs.length) sections.push(`=== UPLOADED & AI-VERIFIED DOCUMENTS ===\n${docs.join("\n")}`);
  }

  return sections.join("\n\n");
};

export const buildDocumentBoost = (analyses?: DocumentAnalysis[]) => {
  if (!analyses || analyses.length === 0) return undefined;
  const to100 = (v: any): number | undefined => {
    const n = Number(v);
    if (!Number.isFinite(n) || n <= 0) return undefined;
    return n <= 10 ? Math.round(n * 10) : Math.round(n);
  };
  const boost: any = {};
  for (const a of analyses) {
    if (!a.result) continue;
    const r = a.result;
    if (a.type === "recommendation") {
      const v = to100(r.impactScore ?? r.strengthRating);
      if (v) boost.recommendationStrength = v;
    } else if (a.type === "transcript") {
      const v = to100(r.academicStrengthScore ?? r.overallRating);
      if (v) boost.transcriptRating = v;
    } else if (a.type === "awards") {
      const v = to100(r.overallImpactScore);
      if (v) boost.awardsImpact = v;
    } else if (a.type === "portfolio") {
      const v = to100(r.overallImpactScore);
      if (v) boost.portfolioImpact = v;
    } else if (a.type === "essay") {
      const v = to100(r.overallRating ?? r.score);
      if (v) boost.essayRating = v;
    }
  }
  return Object.keys(boost).length > 0 ? boost : undefined;
};
