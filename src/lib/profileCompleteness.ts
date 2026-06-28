// Single source of truth for profile completeness across the app

export type FieldKey =
  | "gpa"
  | "extracurriculars"
  | "testScores"
  | "courseRigor"
  | "honorsAwards"
  | "researchExperience"
  | "volunteerHours"
  | "workExperience"
  | "personalContext"
  | "preferredCountries"
  | "intendedMajor";

const FIELD_LABELS: Record<FieldKey, string> = {
  gpa: "GPA / Academic grades",
  extracurriculars: "Extracurricular activities",
  testScores: "Test scores (SAT/ACT/IELTS)",
  courseRigor: "Course rigor (AP/IB/Honors)",
  honorsAwards: "Honors & awards",
  researchExperience: "Research experience",
  volunteerHours: "Volunteer work",
  workExperience: "Work experience",
  personalContext: "Personal context / background",
  preferredCountries: "Target countries",
  intendedMajor: "Intended major",
};

const REQUIRED: FieldKey[] = ["gpa", "extracurriculars"];

const RECOMMENDED: FieldKey[] = [
  "testScores",
  "courseRigor",
  "honorsAwards",
  "researchExperience",
  "volunteerHours",
  "workExperience",
  "personalContext",
  "preferredCountries",
  "intendedMajor",
];

export const getRequiredFields = () => REQUIRED;
export const getRecommendedFields = () => RECOMMENDED;
export const getFieldLabel = (key: FieldKey) => FIELD_LABELS[key] ?? key;

const isFilled = (val: any): boolean => {
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") {
    // personalContext object — consider filled if any non-empty string value
    return Object.values(val).some(
      (v) => typeof v === "string" && v.trim().length > 0,
    );
  }
  const s = String(val).trim();
  return s.length > 0 && s !== "0";
};

const getValue = (profile: any, key: FieldKey): any => {
  if (!profile) return undefined;
  switch (key) {
    case "preferredCountries":
      return profile.preferredCountries ?? profile.target_countries;
    case "testScores":
      return profile.testScores ?? profile.test_scores;
    case "courseRigor":
      return profile.courseRigor ?? profile.course_rigor;
    case "honorsAwards":
      return profile.honorsAwards ?? profile.honors_awards;
    case "researchExperience":
      return profile.researchExperience ?? profile.research_experience;
    case "volunteerHours":
      return profile.volunteerHours ?? profile.volunteer_hours;
    case "workExperience":
      return profile.workExperience ?? profile.work_experience;
    case "personalContext":
      return profile.personalContext ?? profile.personal_context;
    case "intendedMajor":
      return profile.intendedMajor ?? profile.intended_major;
    default:
      return profile[key];
  }
};

export interface CompletenessResult {
  percent: number;
  missingRequired: FieldKey[];
  missingRecommended: FieldKey[];
  filledCount: number;
  totalCount: number;
  hasAllRequired: boolean;
}

export const computeCompleteness = (profile: any): CompletenessResult => {
  const all = [...REQUIRED, ...RECOMMENDED];
  const missingRequired: FieldKey[] = [];
  const missingRecommended: FieldKey[] = [];
  let filledCount = 0;

  for (const key of all) {
    const filled = isFilled(getValue(profile, key));
    if (filled) {
      filledCount++;
    } else if (REQUIRED.includes(key)) {
      missingRequired.push(key);
    } else {
      missingRecommended.push(key);
    }
  }

  const percent = Math.round((filledCount / all.length) * 100);
  return {
    percent,
    missingRequired,
    missingRecommended,
    filledCount,
    totalCount: all.length,
    hasAllRequired: missingRequired.length === 0,
  };
};

export const hasRequiredProfile = (
  profile: any,
  requiredFields: FieldKey[] = REQUIRED,
): boolean => requiredFields.every((k) => isFilled(getValue(profile, k)));
