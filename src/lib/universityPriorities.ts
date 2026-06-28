/**
 * universityPriorities.ts — per-institution admissions priorities.
 *
 * Used by the AI counselor prompt to force genuine differentiation.
 * Stanford reads "intellectual vitality"; LSE reads "subject depth";
 * MIT reads "demonstrated technical building". No more generic advice.
 *
 * Sources: each university's published admissions guidance, undergraduate
 * admissions blogs, and (where available) Common Data Set.
 */

export interface UniversityPriorities {
  /** 0–1: how much research / scholarly output matters in admissions. */
  researchEmphasis: number;
  /** 0–1: how much holistic/personal narrative matters. */
  holisticEmphasis: number;
  /** 0–1: how much standardized testing matters in their decision. */
  testEmphasis: number;
  /** Distinctive priorities they explicitly publish (verbatim phrasing where possible). */
  distinctivePriorities: string[];
  /** Common reasons strong candidates get rejected here. */
  knownDealbreakers: string[];
  /** Short citation/source note. */
  sourceNotes: string;
}

export const universityPriorities: Record<string, UniversityPriorities> = {
  "Harvard University": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.95,
    testEmphasis: 0.7,
    distinctivePriorities: [
      "transformative impact in chosen field",
      "intellectual curiosity beyond the classroom",
      "evidence of leadership at scale",
    ],
    knownDealbreakers: [
      "essays that read like résumé recaps",
      "no clear central narrative across the application",
    ],
    sourceNotes: "Harvard College Admissions site + alumni interview guidance.",
  },
  "Stanford University": {
    researchEmphasis: 0.7,
    holisticEmphasis: 0.95,
    testEmphasis: 0.65,
    distinctivePriorities: [
      "intellectual vitality",
      "self-driven projects outside school",
      "originality in supplemental essays",
    ],
    knownDealbreakers: [
      "supplements that play it safe",
      "no evidence of building or making something",
    ],
    sourceNotes: "Stanford Undergraduate Admission published guidance.",
  },
  "MIT": {
    researchEmphasis: 0.85,
    holisticEmphasis: 0.7,
    testEmphasis: 0.85,
    distinctivePriorities: [
      "demonstrated technical building (projects, research, competitions)",
      "collaboration and mentorship of peers",
      "intensity of focus on a STEM passion",
    ],
    knownDealbreakers: [
      "STEM interest only on paper, no projects",
      "weak math/physics rigor for a STEM applicant",
    ],
    sourceNotes: "MIT Admissions blogs + 'What we look for' page.",
  },
  "Yale University": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.95,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "depth in 1–2 areas over breadth",
      "writing that reveals voice and values",
      "engagement with community over competition",
    ],
    knownDealbreakers: [
      "scattered activity list with no spike",
      "essays without a thesis",
    ],
    sourceNotes: "Yale Admissions 'What Yale Looks For'.",
  },
  "Princeton University": {
    researchEmphasis: 0.75,
    holisticEmphasis: 0.85,
    testEmphasis: 0.8,
    distinctivePriorities: [
      "scholarly seriousness and academic preparation",
      "service orientation ('in the nation's service')",
      "independent intellectual work",
    ],
    knownDealbreakers: [
      "weak supplemental on academic interests",
      "no evidence of independent thinking",
    ],
    sourceNotes: "Princeton Admission Office published criteria.",
  },
  "Columbia University": {
    researchEmphasis: 0.6,
    holisticEmphasis: 0.85,
    testEmphasis: 0.5,
    distinctivePriorities: [
      "engagement with the Core Curriculum philosophy",
      "intellectual breadth across disciplines",
      "connection to NYC and urban life",
    ],
    knownDealbreakers: [
      "supplements that don't address fit with the Core",
      "no curiosity outside chosen major",
    ],
    sourceNotes: "Columbia Undergraduate Admissions site.",
  },
  "University of Pennsylvania": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.85,
    testEmphasis: 0.6,
    distinctivePriorities: [
      "concrete career direction (the 'Why Penn' essay)",
      "interdisciplinary interest across schools",
      "entrepreneurial or applied projects",
    ],
    knownDealbreakers: [
      "vague 'Why Penn' essay",
      "no specificity about programs/professors",
    ],
    sourceNotes: "Penn Admissions guidance + alumni reading rubric.",
  },
  "Brown University": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.95,
    testEmphasis: 0.7,
    distinctivePriorities: [
      "fit with Open Curriculum (self-directed learning)",
      "creativity and risk-taking in the application",
      "intellectual playfulness",
    ],
    knownDealbreakers: [
      "supplements that don't engage with the Open Curriculum",
      "rigid, single-track academic identity",
    ],
    sourceNotes: "Brown Undergraduate Admissions published guidance.",
  },
  "Dartmouth College": {
    researchEmphasis: 0.5,
    holisticEmphasis: 0.9,
    testEmphasis: 0.85,
    distinctivePriorities: [
      "outdoor/community orientation",
      "willingness to engage in close-knit residential life",
      "leadership through collaboration",
    ],
    knownDealbreakers: [
      "no signal that you'll engage with a small-college environment",
    ],
    sourceNotes: "Dartmouth Admissions site.",
  },
  "Cornell University": {
    researchEmphasis: 0.6,
    holisticEmphasis: 0.7,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "fit with the specific undergraduate college you apply to",
      "preparation in your stated major",
      "depth in pre-professional or applied interests",
    ],
    knownDealbreakers: [
      "applying to the wrong college within Cornell for your interests",
      "weak academic prep in chosen field",
    ],
    sourceNotes: "Cornell Undergraduate Admissions per-college guidance.",
  },
  "University of Chicago": {
    researchEmphasis: 0.7,
    holisticEmphasis: 0.95,
    testEmphasis: 0.5,
    distinctivePriorities: [
      "intellectual rigor and 'life of the mind'",
      "originality in the famously quirky supplements",
      "comfort with uncomfortable ideas",
    ],
    knownDealbreakers: [
      "supplements that play safe or read generic",
      "no evidence of intellectual risk-taking",
    ],
    sourceNotes: "UChicago Admissions + supplemental essay guidance.",
  },
  "Duke University": {
    researchEmphasis: 0.65,
    holisticEmphasis: 0.85,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "leadership with measurable impact",
      "interdisciplinary thinking",
      "fit with the 'Duke difference' (collaborative ambition)",
    ],
    knownDealbreakers: [
      "leadership claims without scope or outcomes",
    ],
    sourceNotes: "Duke Undergraduate Admissions site.",
  },
  "Northwestern University": {
    researchEmphasis: 0.6,
    holisticEmphasis: 0.8,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "specific reasons for Northwestern (not just rankings)",
      "evidence of pre-professional focus where relevant (journalism, theater, engineering)",
    ],
    knownDealbreakers: [
      "generic 'why us' essay",
    ],
    sourceNotes: "Northwestern Undergraduate Admissions.",
  },
  "Johns Hopkins University": {
    researchEmphasis: 0.9,
    holisticEmphasis: 0.7,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "research experience or aptitude (especially STEM/health)",
      "evidence of independent inquiry",
      "fit with collaborative research culture",
    ],
    knownDealbreakers: [
      "no evidence of research interest for STEM applicants",
    ],
    sourceNotes: "Johns Hopkins Undergraduate Admissions essays that worked.",
  },
  "UC Berkeley": {
    researchEmphasis: 0.6,
    holisticEmphasis: 0.85,
    testEmphasis: 0.0,
    distinctivePriorities: [
      "Personal Insight Questions (PIQs) — concrete stories",
      "demonstrated context (what resources you had access to)",
      "leadership and service in your community",
    ],
    knownDealbreakers: [
      "PIQs without concrete examples or specific outcomes",
    ],
    sourceNotes: "UC Application Personal Insight Questions guidance.",
  },
  "UCLA": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.85,
    testEmphasis: 0.0,
    distinctivePriorities: [
      "Personal Insight Questions — depth over polish",
      "context-aware achievement (within your circumstances)",
    ],
    knownDealbreakers: [
      "PIQs that summarize résumé instead of telling stories",
    ],
    sourceNotes: "UC Application Personal Insight Questions guidance.",
  },

  // ───────────────────────────── UK ─────────────────────────────
  "University of Oxford": {
    researchEmphasis: 0.85,
    holisticEmphasis: 0.3,
    testEmphasis: 0.95,
    distinctivePriorities: [
      "subject mastery in your chosen course (not breadth)",
      "performance on the admissions test (LNAT, MAT, TSA, etc.)",
      "interview reasoning under pressure",
    ],
    knownDealbreakers: [
      "personal statement that drifts off-subject",
      "weak admissions test score",
    ],
    sourceNotes: "Oxford Admissions selection criteria per course.",
  },
  "University of Cambridge": {
    researchEmphasis: 0.85,
    holisticEmphasis: 0.3,
    testEmphasis: 0.95,
    distinctivePriorities: [
      "deep evidence of subject curiosity (super-curricular reading)",
      "STEP/admissions test performance where required",
      "interview problem-solving",
    ],
    knownDealbreakers: [
      "no super-curricular evidence beyond school syllabus",
    ],
    sourceNotes: "Cambridge Admissions assessment criteria.",
  },
  "Imperial College London": {
    researchEmphasis: 0.85,
    holisticEmphasis: 0.3,
    testEmphasis: 0.95,
    distinctivePriorities: [
      "STEM subject depth (especially Maths/Physics)",
      "research or technical project evidence",
      "MAT/STEP/admissions test performance",
    ],
    knownDealbreakers: [
      "weak Maths predicted/achieved for STEM courses",
    ],
    sourceNotes: "Imperial Undergraduate Admissions guidance.",
  },
  "London School of Economics": {
    researchEmphasis: 0.7,
    holisticEmphasis: 0.4,
    testEmphasis: 0.85,
    distinctivePriorities: [
      "subject focus on social sciences",
      "personal statement that engages with academic content (not work experience)",
      "strong Maths if applying to economics/finance",
    ],
    knownDealbreakers: [
      "personal statement focused on extracurriculars over subject",
      "weak Maths for Economics",
    ],
    sourceNotes: "LSE Undergraduate Admissions selection guidance.",
  },
  "University College London": {
    researchEmphasis: 0.65,
    holisticEmphasis: 0.45,
    testEmphasis: 0.7,
    distinctivePriorities: [
      "subject knowledge and motivation",
      "predicted grades meeting course-specific cutoffs",
    ],
    knownDealbreakers: [
      "predicted grades below course minimum",
    ],
    sourceNotes: "UCL Undergraduate Admissions per-programme entry requirements.",
  },
  "University of Edinburgh": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.4,
    testEmphasis: 0.6,
    distinctivePriorities: [
      "personal statement subject focus (~75% subject content)",
      "meeting published grade requirements",
    ],
    knownDealbreakers: [
      "off-topic personal statement",
    ],
    sourceNotes: "Edinburgh Undergraduate Admissions guidance.",
  },

  // ───────────────────────────── Canada ─────────────────────────────
  "University of Toronto": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.45,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "academic record meeting published cutoffs (esp. for Eng/CS/Rotman)",
      "supplemental application essays where required",
    ],
    knownDealbreakers: [
      "weak supplemental for competitive programs (Rotman, Engineering, CS)",
    ],
    sourceNotes: "U of T Undergraduate Admissions per-program guidance.",
  },
  "McGill University": {
    researchEmphasis: 0.5,
    holisticEmphasis: 0.3,
    testEmphasis: 0.5,
    distinctivePriorities: [
      "grades-driven admission (relatively transparent cutoffs)",
      "minimal essays — pure academic record matters most",
    ],
    knownDealbreakers: [
      "grades below published cutoff for chosen faculty",
    ],
    sourceNotes: "McGill Undergraduate Admissions cutoffs.",
  },
  "University of British Columbia": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.65,
    testEmphasis: 0.45,
    distinctivePriorities: [
      "Personal Profile responses (broad-based admission)",
      "evidence of engagement and contribution beyond academics",
    ],
    knownDealbreakers: [
      "weak Personal Profile despite strong grades",
    ],
    sourceNotes: "UBC Personal Profile guidance.",
  },

  // ───────────────────────────── Asia / Pacific / Europe ─────────────────────────────
  "National University of Singapore": {
    researchEmphasis: 0.7,
    holisticEmphasis: 0.45,
    testEmphasis: 0.85,
    distinctivePriorities: [
      "subject test performance",
      "academic record from feeder curriculum (A-levels, IB, AP)",
    ],
    knownDealbreakers: [
      "weak subject preparation in intended major",
    ],
    sourceNotes: "NUS Office of Admissions.",
  },
  "University of Tokyo": {
    researchEmphasis: 0.8,
    holisticEmphasis: 0.4,
    testEmphasis: 0.95,
    distinctivePriorities: [
      "entrance exam performance",
      "subject mastery for intended faculty",
    ],
    knownDealbreakers: [
      "weak entrance exam result",
    ],
    sourceNotes: "University of Tokyo PEAK / general admissions.",
  },
  "University of Hong Kong": {
    researchEmphasis: 0.55,
    holisticEmphasis: 0.55,
    testEmphasis: 0.7,
    distinctivePriorities: [
      "subject prerequisites for chosen programme",
      "interview performance for competitive programmes",
    ],
    knownDealbreakers: [
      "missing required subjects for chosen programme",
    ],
    sourceNotes: "HKU Undergraduate Admissions site.",
  },
  "Australian National University": {
    researchEmphasis: 0.6,
    holisticEmphasis: 0.4,
    testEmphasis: 0.55,
    distinctivePriorities: [
      "ATAR/equivalent meeting course cutoffs",
      "subject prerequisites",
    ],
    knownDealbreakers: [
      "ATAR/equivalent below cutoff",
    ],
    sourceNotes: "ANU Undergraduate Admissions.",
  },
  "University of Melbourne": {
    researchEmphasis: 0.5,
    holisticEmphasis: 0.4,
    testEmphasis: 0.5,
    distinctivePriorities: [
      "grades meeting course cutoffs",
      "Melbourne Model: broad first degree, specialise in graduate study",
    ],
    knownDealbreakers: [
      "applying for a specialisation that requires graduate study",
    ],
    sourceNotes: "University of Melbourne Undergraduate Admissions.",
  },
  "ETH Zurich": {
    researchEmphasis: 0.9,
    holisticEmphasis: 0.2,
    testEmphasis: 0.95,
    distinctivePriorities: [
      "very strong Maths/Physics record",
      "ability to handle Swiss-style rigorous theoretical curriculum",
    ],
    knownDealbreakers: [
      "weak Maths/Physics preparation",
    ],
    sourceNotes: "ETH Bachelor admissions requirements.",
  },
  "Technical University of Munich": {
    researchEmphasis: 0.85,
    holisticEmphasis: 0.3,
    testEmphasis: 0.85,
    distinctivePriorities: [
      "STEM grade record",
      "TestAS / aptitude assessment for international applicants",
    ],
    knownDealbreakers: [
      "weak STEM record for engineering/CS programmes",
    ],
    sourceNotes: "TUM Admissions guidance.",
  },
};

/** Safe lookup with sane fallback for unknown unis. */
export const getPriorities = (uniName: string): UniversityPriorities => {
  return (
    universityPriorities[uniName] || {
      researchEmphasis: 0.5,
      holisticEmphasis: 0.6,
      testEmphasis: 0.6,
      distinctivePriorities: ["academic preparation", "evidence of impact in your activities"],
      knownDealbreakers: ["unfocused application", "weak academic record"],
      sourceNotes: "Generic baseline (institution-specific data not yet curated).",
    }
  );
};
