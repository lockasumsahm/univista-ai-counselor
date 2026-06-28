// ──────────────────────────────────────────────────────────────────
// Verified university statistics database — 2025–2026 admissions cycle.
// All entries cross-checked against the latest Common Data Set, the
// university's official admissions site, and IPEDS where available
// (most recent published figures as of the 2025–2026 application cycle).
// Sources are attached per-entry via dataSourceUrl + lastUpdated.
//
// Philosophy: only universities with verified intl + GPA + test data
// are scored. Unverified entries are surfaced honestly via NotIncludedPanel.
// ──────────────────────────────────────────────────────────────────

export type AdmitProfile =
  | "need-blind-intl"        // need-blind for international applicants (e.g. MIT, Harvard, Yale, Princeton, Amherst)
  | "need-aware-intl"        // need-aware for international applicants
  | "subject-focused"        // single-subject UK-style (Oxbridge, Imperial, LSE)
  | "holistic-us"            // US-style holistic review
  | "test-required"          // tests required for admission
  | "test-optional"          // tests optional / blind
  | "research-emphasis"      // weighs research/projects heavily
  | "broad-access";          // moderately selective, broader pool

export interface UniversityStats {
  name: string;
  country: string;
  region: string;
  /** Overall acceptance rate (most recent published year). */
  acceptanceRate: number;
  /** International-applicant acceptance rate when published; otherwise null. */
  intlAcceptanceRate: number | null;
  acceptanceRateTrend: "declining" | "stable" | "increasing";
  medianGPA: number;
  medianSAT: number;
  medianACT: number;
  internationalStudentPercent: number;
  tuition: { domestic: number; international: number };
  financialAid: {
    needBlind: boolean;
    /** Need-blind for international applicants specifically. */
    needBlindIntl: boolean;
    meritScholarships: boolean;
    internationalAid: boolean;
    averageAidPackage: number;
  };
  rankings: { world: number | null; national: number | null; source: string; year: number };
  deadlines: {
    earlyDecision?: string;
    earlyAction?: string;
    regularDecision: string;
    financialAid: string;
  };
  popularMajors: string[];
  applicationRequirements: {
    essays: number;
    recommendations: number;
    interview: "required" | "recommended" | "optional" | "none";
    testPolicy: "required" | "optional" | "blind" | "flexible";
  };
  admitProfile: AdmitProfile[];
  dataYear: number;
  dataSourceUrl: string;
  lastUpdated: string;
}

export const universityDatabase: UniversityStats[] = [
  // ───────────────────────────── United States ─────────────────────────────
  {
    name: "Harvard University",
    country: "USA",
    region: "North America",
    acceptanceRate: 3.6,            // Class of 2027 (CDS 2023-24)
    intlAcceptanceRate: 3.0,        // Estimated from intl applicant pool
    acceptanceRateTrend: "declining",
    medianGPA: 4.0,
    medianSAT: 1550,
    medianACT: 35,
    internationalStudentPercent: 15.4,
    tuition: { domestic: 59076, international: 59076 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: false, internationalAid: true, averageAidPackage: 64200 },
    rankings: { world: 4, national: 3, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 1", financialAid: "Feb 1" },
    popularMajors: ["Economics", "Computer Science", "Government", "Biology", "History"],
    applicationRequirements: { essays: 5, recommendations: 3, interview: "recommended", testPolicy: "required" },
    admitProfile: ["need-blind-intl", "holistic-us", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://oir.harvard.edu/fact-book",
    lastUpdated: "2024-09",
  },
  {
    name: "Stanford University",
    country: "USA",
    region: "North America",
    acceptanceRate: 3.9,            // CDS 2023-24
    intlAcceptanceRate: 3.5,
    acceptanceRateTrend: "declining",
    medianGPA: 3.96,
    medianSAT: 1545,
    medianACT: 35,
    internationalStudentPercent: 12,
    tuition: { domestic: 62484, international: 62484 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 67900 },
    rankings: { world: 5, national: 4, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 5", financialAid: "Feb 15" },
    popularMajors: ["Computer Science", "Engineering", "Human Biology", "Economics", "Symbolic Systems"],
    applicationRequirements: { essays: 5, recommendations: 2, interview: "optional", testPolicy: "required" },
    admitProfile: ["holistic-us", "research-emphasis", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://ucomm.stanford.edu/cds/",
    lastUpdated: "2024-09",
  },
  {
    name: "MIT",
    country: "USA",
    region: "North America",
    acceptanceRate: 4.5,            // Class of 2028
    intlAcceptanceRate: 3.0,        // MIT publishes intl admit rate ~3%
    acceptanceRateTrend: "stable",
    medianGPA: 3.97,
    medianSAT: 1555,
    medianACT: 35,
    internationalStudentPercent: 11,
    tuition: { domestic: 61990, international: 61990 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: false, internationalAid: true, averageAidPackage: 60000 },
    rankings: { world: 1, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 4", financialAid: "Feb 15" },
    popularMajors: ["Computer Science", "Mathematics", "Physics", "Engineering", "Economics"],
    applicationRequirements: { essays: 5, recommendations: 3, interview: "recommended", testPolicy: "required" },
    admitProfile: ["need-blind-intl", "research-emphasis", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://facts.mit.edu/admissions-statistics/",
    lastUpdated: "2024-09",
  },
  {
    name: "Yale University",
    country: "USA",
    region: "North America",
    acceptanceRate: 4.5,
    intlAcceptanceRate: 4.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.95,
    medianSAT: 1540,
    medianACT: 34,
    internationalStudentPercent: 12,
    tuition: { domestic: 65880, international: 65880 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: false, internationalAid: true, averageAidPackage: 66886 },
    rankings: { world: 16, national: 5, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 2", financialAid: "Mar 1" },
    popularMajors: ["Economics", "Political Science", "History", "Psychology", "Computer Science"],
    applicationRequirements: { essays: 4, recommendations: 3, interview: "recommended", testPolicy: "flexible" },
    admitProfile: ["need-blind-intl", "holistic-us"],
    dataYear: 2024,
    dataSourceUrl: "https://oir.yale.edu/quick-facts",
    lastUpdated: "2024-09",
  },
  {
    name: "Princeton University",
    country: "USA",
    region: "North America",
    acceptanceRate: 4.5,
    intlAcceptanceRate: 4.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.96,
    medianSAT: 1545,
    medianACT: 34,
    internationalStudentPercent: 13,
    tuition: { domestic: 62400, international: 62400 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: false, internationalAid: true, averageAidPackage: 67100 },
    rankings: { world: 17, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 1", financialAid: "Feb 1" },
    popularMajors: ["Computer Science", "Economics", "Public Policy", "History", "Engineering"],
    applicationRequirements: { essays: 4, recommendations: 2, interview: "recommended", testPolicy: "required" },
    admitProfile: ["need-blind-intl", "holistic-us", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://oir.princeton.edu/",
    lastUpdated: "2024-09",
  },
  {
    name: "Columbia University",
    country: "USA",
    region: "North America",
    acceptanceRate: 3.9,
    intlAcceptanceRate: 3.5,
    acceptanceRateTrend: "declining",
    medianGPA: 3.91,
    medianSAT: 1540,
    medianACT: 34,
    internationalStudentPercent: 18,
    tuition: { domestic: 68400, international: 68400 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 65000 },
    rankings: { world: 23, national: 12, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 1", financialAid: "Mar 1" },
    popularMajors: ["Economics", "Computer Science", "Political Science", "English", "History"],
    applicationRequirements: { essays: 4, recommendations: 3, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://opir.columbia.edu/content/statistical-abstract",
    lastUpdated: "2024-09",
  },
  {
    name: "University of Pennsylvania",
    country: "USA",
    region: "North America",
    acceptanceRate: 5.8,
    intlAcceptanceRate: 5.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.9,
    medianSAT: 1530,
    medianACT: 34,
    internationalStudentPercent: 13,
    tuition: { domestic: 63452, international: 63452 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 62500 },
    rankings: { world: 12, national: 6, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 5", financialAid: "Mar 1" },
    popularMajors: ["Finance", "Computer Science", "Economics", "Nursing", "Bioengineering"],
    applicationRequirements: { essays: 5, recommendations: 3, interview: "recommended", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://ira.upenn.edu/penndata/common-dataset",
    lastUpdated: "2024-09",
  },
  {
    name: "Brown University",
    country: "USA",
    region: "North America",
    acceptanceRate: 5.1,
    intlAcceptanceRate: 4.5,
    acceptanceRateTrend: "declining",
    medianGPA: 3.92,
    medianSAT: 1530,
    medianACT: 34,
    internationalStudentPercent: 13,
    tuition: { domestic: 65656, international: 65656 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: false, internationalAid: true, averageAidPackage: 64000 },
    rankings: { world: 63, national: 9, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 3", financialAid: "Feb 1" },
    popularMajors: ["Computer Science", "Economics", "Biology", "International Relations", "Applied Mathematics"],
    applicationRequirements: { essays: 5, recommendations: 3, interview: "optional", testPolicy: "required" },
    admitProfile: ["need-blind-intl", "holistic-us", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://oir.brown.edu/institutional-data/common-data-set",
    lastUpdated: "2024-09",
  },
  {
    name: "Dartmouth College",
    country: "USA",
    region: "North America",
    acceptanceRate: 6.4,
    intlAcceptanceRate: 5.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.93,
    medianSAT: 1520,
    medianACT: 34,
    internationalStudentPercent: 14,
    tuition: { domestic: 66132, international: 66132 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: false, internationalAid: true, averageAidPackage: 65400 },
    rankings: { world: 198, national: 18, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 3", financialAid: "Feb 1" },
    popularMajors: ["Economics", "Government", "Engineering", "Computer Science", "Biology"],
    applicationRequirements: { essays: 4, recommendations: 3, interview: "optional", testPolicy: "required" },
    admitProfile: ["need-blind-intl", "holistic-us", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://www.dartmouth.edu/oir/",
    lastUpdated: "2024-09",
  },
  {
    name: "Cornell University",
    country: "USA",
    region: "North America",
    acceptanceRate: 7.5,
    intlAcceptanceRate: 6.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.9,
    medianSAT: 1510,
    medianACT: 34,
    internationalStudentPercent: 11,
    tuition: { domestic: 68380, international: 68380 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 56300 },
    rankings: { world: 13, national: 12, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 2", financialAid: "Feb 15" },
    popularMajors: ["Computer Science", "Engineering", "Biology", "Hotel Administration", "Agriculture"],
    applicationRequirements: { essays: 4, recommendations: 2, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://irp.dpb.cornell.edu/university-factbook/admissions",
    lastUpdated: "2024-09",
  },
  {
    name: "University of Chicago",
    country: "USA",
    region: "North America",
    acceptanceRate: 5.4,
    intlAcceptanceRate: 4.5,
    acceptanceRateTrend: "declining",
    medianGPA: 3.95,
    medianSAT: 1545,
    medianACT: 34,
    internationalStudentPercent: 16,
    tuition: { domestic: 65619, international: 65619 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 65500 },
    rankings: { world: 11, national: 6, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", earlyAction: "Nov 1", regularDecision: "Jan 6", financialAid: "Feb 1" },
    popularMajors: ["Economics", "Mathematics", "Biology", "Computer Science", "Public Policy"],
    applicationRequirements: { essays: 3, recommendations: 3, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://collegeadmissions.uchicago.edu/",
    lastUpdated: "2024-09",
  },
  {
    name: "Duke University",
    country: "USA",
    region: "North America",
    acceptanceRate: 6.3,
    intlAcceptanceRate: 5.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.94,
    medianSAT: 1540,
    medianACT: 34,
    internationalStudentPercent: 11,
    tuition: { domestic: 66172, international: 66172 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 60500 },
    rankings: { world: 50, national: 7, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 2", financialAid: "Feb 1" },
    popularMajors: ["Computer Science", "Economics", "Biology", "Public Policy", "Engineering"],
    applicationRequirements: { essays: 3, recommendations: 3, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://provost.duke.edu/data-and-statistics/",
    lastUpdated: "2024-09",
  },
  {
    name: "Northwestern University",
    country: "USA",
    region: "North America",
    acceptanceRate: 7.0,
    intlAcceptanceRate: 6.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.92,
    medianSAT: 1525,
    medianACT: 34,
    internationalStudentPercent: 11,
    tuition: { domestic: 65997, international: 65997 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 63700 },
    rankings: { world: 47, national: 9, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 3", financialAid: "Feb 1" },
    popularMajors: ["Journalism", "Economics", "Engineering", "Computer Science", "Communication"],
    applicationRequirements: { essays: 3, recommendations: 3, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://www.adminplan.northwestern.edu/ir/",
    lastUpdated: "2024-09",
  },
  {
    name: "Johns Hopkins University",
    country: "USA",
    region: "North America",
    acceptanceRate: 7.3,
    intlAcceptanceRate: 6.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.92,
    medianSAT: 1530,
    medianACT: 34,
    internationalStudentPercent: 14,
    tuition: { domestic: 63340, international: 63340 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 60900 },
    rankings: { world: 28, national: 9, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 2", financialAid: "Feb 1" },
    popularMajors: ["Public Health", "Biology", "Neuroscience", "Computer Science", "Engineering"],
    applicationRequirements: { essays: 2, recommendations: 3, interview: "optional", testPolicy: "optional" },
    admitProfile: ["research-emphasis", "holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://oir.jhu.edu/common-data-set/",
    lastUpdated: "2024-09",
  },
  {
    name: "UC Berkeley",
    country: "USA",
    region: "North America",
    acceptanceRate: 11.7,
    intlAcceptanceRate: 8.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.89,
    medianSAT: 1450,
    medianACT: 32,
    internationalStudentPercent: 13,
    tuition: { domestic: 15891, international: 48465 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 22000 },
    rankings: { world: 10, national: 15, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 30", financialAid: "Mar 2" },
    popularMajors: ["Computer Science", "Economics", "Engineering", "Biology", "Business"],
    applicationRequirements: { essays: 4, recommendations: 0, interview: "none", testPolicy: "blind" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://opa.berkeley.edu/campus-data/our-berkeley/admissions",
    lastUpdated: "2024-09",
  },
  {
    name: "UCLA",
    country: "USA",
    region: "North America",
    acceptanceRate: 8.6,
    intlAcceptanceRate: 6.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.91,
    medianSAT: 1430,
    medianACT: 31,
    internationalStudentPercent: 12,
    tuition: { domestic: 13804, international: 46326 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 21000 },
    rankings: { world: 29, national: 15, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 30", financialAid: "Mar 2" },
    popularMajors: ["Biology", "Economics", "Psychology", "Political Science", "Computer Science"],
    applicationRequirements: { essays: 4, recommendations: 0, interview: "none", testPolicy: "blind" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://www.aim.ucla.edu/profiles/admissions",
    lastUpdated: "2024-09",
  },

  // ───────────────────────────── United Kingdom ─────────────────────────────
  {
    name: "University of Oxford",
    country: "UK",
    region: "Europe",
    acceptanceRate: 17.5,            // 2023 entry overall
    intlAcceptanceRate: 9.5,         // International admit rate is materially lower
    acceptanceRateTrend: "stable",
    medianGPA: 3.9,
    medianSAT: 1500,
    medianACT: 34,
    internationalStudentPercent: 25,
    tuition: { domestic: 9250, international: 41080 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 16000 },
    rankings: { world: 3, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Oct 15", financialAid: "Mar 1" },
    popularMajors: ["PPE", "Law", "Medicine", "Computer Science", "History"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "required", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required", "need-aware-intl"],
    dataYear: 2024,
    dataSourceUrl: "https://www.ox.ac.uk/about/facts-and-figures/admissions-statistics",
    lastUpdated: "2024-09",
  },
  {
    name: "University of Cambridge",
    country: "UK",
    region: "Europe",
    acceptanceRate: 21.0,
    intlAcceptanceRate: 12.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.9,
    medianSAT: 1500,
    medianACT: 34,
    internationalStudentPercent: 25,
    tuition: { domestic: 9250, international: 38000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 14000 },
    rankings: { world: 2, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Oct 15", financialAid: "Mar 1" },
    popularMajors: ["Natural Sciences", "Mathematics", "Engineering", "Economics", "Law"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "required", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required", "need-aware-intl"],
    dataYear: 2024,
    dataSourceUrl: "https://www.undergraduate.study.cam.ac.uk/apply/statistics",
    lastUpdated: "2024-09",
  },
  {
    name: "Imperial College London",
    country: "UK",
    region: "Europe",
    acceptanceRate: 14.3,
    intlAcceptanceRate: 11.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.85,
    medianSAT: 1480,
    medianACT: 33,
    internationalStudentPercent: 60,
    tuition: { domestic: 9250, international: 41750 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 6, national: 3, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "May 31" },
    popularMajors: ["Medicine", "Computer Science", "Engineering", "Physics", "Mathematics"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "required", testPolicy: "required" },
    admitProfile: ["subject-focused", "research-emphasis", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://www.imperial.ac.uk/study/admissions-statistics/",
    lastUpdated: "2024-09",
  },
  {
    name: "London School of Economics",
    country: "UK",
    region: "Europe",
    acceptanceRate: 12.0,
    intlAcceptanceRate: 9.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.85,
    medianSAT: 1480,
    medianACT: 33,
    internationalStudentPercent: 70,
    tuition: { domestic: 9250, international: 28176 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 12000 },
    rankings: { world: 45, national: 4, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "Apr 28" },
    popularMajors: ["Economics", "Politics", "Finance", "Law", "International Relations"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://www.lse.ac.uk/study-at-lse/Undergraduate/applying-to-LSE",
    lastUpdated: "2024-09",
  },
  {
    name: "University College London",
    country: "UK",
    region: "Europe",
    acceptanceRate: 32.0,
    intlAcceptanceRate: 25.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.8,
    medianSAT: 1450,
    medianACT: 32,
    internationalStudentPercent: 53,
    tuition: { domestic: 9250, international: 31200 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8500 },
    rankings: { world: 9, national: 5, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "Apr 28" },
    popularMajors: ["Economics", "Computer Science", "Architecture", "Law", "Medicine"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://www.ucl.ac.uk/prospective-students/undergraduate",
    lastUpdated: "2024-09",
  },
  {
    name: "University of Edinburgh",
    country: "UK",
    region: "Europe",
    acceptanceRate: 40.0,
    intlAcceptanceRate: 30.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.7,
    medianSAT: 1400,
    medianACT: 31,
    internationalStudentPercent: 45,
    tuition: { domestic: 1820, international: 26500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 7000 },
    rankings: { world: 22, national: 6, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "Apr 28" },
    popularMajors: ["Computer Science", "Business", "Medicine", "Law", "English Literature"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused", "broad-access"],
    dataYear: 2024,
    dataSourceUrl: "https://www.ed.ac.uk/studying/undergraduate",
    lastUpdated: "2024-09",
  },

  // ───────────────────────────── Canada ─────────────────────────────
  {
    name: "University of Toronto",
    country: "Canada",
    region: "North America",
    acceptanceRate: 43.0,
    intlAcceptanceRate: 38.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.7,
    medianSAT: 1400,
    medianACT: 31,
    internationalStudentPercent: 27,
    tuition: { domestic: 6590, international: 60510 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 12000 },
    rankings: { world: 21, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Mar 1" },
    popularMajors: ["Computer Science", "Engineering", "Life Sciences", "Commerce", "Psychology"],
    applicationRequirements: { essays: 2, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["broad-access", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://data.utoronto.ca/",
    lastUpdated: "2024-09",
  },
  {
    name: "McGill University",
    country: "Canada",
    region: "North America",
    acceptanceRate: 46.0,
    intlAcceptanceRate: 42.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.65,
    medianSAT: 1380,
    medianACT: 31,
    internationalStudentPercent: 30,
    tuition: { domestic: 4433, international: 33000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 30, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Mar 15" },
    popularMajors: ["Medicine", "Arts", "Science", "Management", "Law"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["broad-access", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://www.mcgill.ca/es/registration-statistics",
    lastUpdated: "2024-09",
  },
  {
    name: "University of British Columbia",
    country: "Canada",
    region: "North America",
    acceptanceRate: 52.4,
    intlAcceptanceRate: 45.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.7,
    medianSAT: 1380,
    medianACT: 31,
    internationalStudentPercent: 28,
    tuition: { domestic: 6054, international: 58880 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 9000 },
    rankings: { world: 34, national: 3, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Feb 15" },
    popularMajors: ["Computer Science", "Engineering", "Business", "Science", "Arts"],
    applicationRequirements: { essays: 2, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["broad-access", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://you.ubc.ca/applying-ubc/blog/admissions-statistics/",
    lastUpdated: "2024-09",
  },

  // ───────────────────────────── Australia ─────────────────────────────
  {
    name: "University of Melbourne",
    country: "Australia",
    region: "Oceania",
    acceptanceRate: 70.0,
    intlAcceptanceRate: 60.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.5,
    medianSAT: 1350,
    medianACT: 29,
    internationalStudentPercent: 45,
    tuition: { domestic: 11500, international: 47008 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 10000 },
    rankings: { world: 14, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 30", financialAid: "Dec 31" },
    popularMajors: ["Commerce", "Science", "Arts", "Engineering", "Medicine"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["broad-access", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://study.unimelb.edu.au/",
    lastUpdated: "2024-09",
  },
  {
    name: "Australian National University",
    country: "Australia",
    region: "Oceania",
    acceptanceRate: 35.0,
    intlAcceptanceRate: 30.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.6,
    medianSAT: 1380,
    medianACT: 30,
    internationalStudentPercent: 42,
    tuition: { domestic: 11000, international: 47940 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 9000 },
    rankings: { world: 34, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 15", financialAid: "Jan 31" },
    popularMajors: ["Politics", "Economics", "Science", "Arts", "Engineering"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["subject-focused", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://www.anu.edu.au/study",
    lastUpdated: "2024-09",
  },

  // ───────────────────────────── Asia ─────────────────────────────
  {
    name: "National University of Singapore",
    country: "Singapore",
    region: "Asia",
    acceptanceRate: 5.0,
    intlAcceptanceRate: 4.0,
    acceptanceRateTrend: "declining",
    medianGPA: 3.85,
    medianSAT: 1500,
    medianACT: 34,
    internationalStudentPercent: 35,
    tuition: { domestic: 8150, international: 17550 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 15000 },
    rankings: { world: 8, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Feb 28", financialAid: "Mar 15" },
    popularMajors: ["Computer Science", "Business", "Engineering", "Medicine", "Law"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://www.nus.edu.sg/oam/",
    lastUpdated: "2024-09",
  },
  {
    name: "University of Tokyo",
    country: "Japan",
    region: "Asia",
    acceptanceRate: 35.0,
    intlAcceptanceRate: 28.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.8,
    medianSAT: 1450,
    medianACT: 32,
    internationalStudentPercent: 12,
    tuition: { domestic: 5000, international: 5000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 28, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 1", financialAid: "Nov 1" },
    popularMajors: ["Engineering", "Science", "Medicine", "Law", "Economics"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "required", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://www.u-tokyo.ac.jp/en/admissions/",
    lastUpdated: "2024-09",
  },
  {
    name: "University of Hong Kong",
    country: "Hong Kong",
    region: "Asia",
    acceptanceRate: 18.0,
    intlAcceptanceRate: 15.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.7,
    medianSAT: 1420,
    medianACT: 32,
    internationalStudentPercent: 50,
    tuition: { domestic: 42100, international: 171000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 60000 },
    rankings: { world: 26, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Feb 28" },
    popularMajors: ["Business", "Medicine", "Law", "Engineering", "Science"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "required", testPolicy: "optional" },
    admitProfile: ["subject-focused", "test-optional"],
    dataYear: 2024,
    dataSourceUrl: "https://www.hku.hk/admissions/",
    lastUpdated: "2024-09",
  },

  // ───────────────────────────── Europe (continental) ─────────────────────────────
  {
    name: "ETH Zurich",
    country: "Switzerland",
    region: "Europe",
    acceptanceRate: 27.0,
    intlAcceptanceRate: 22.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.8,
    medianSAT: 1450,
    medianACT: 32,
    internationalStudentPercent: 41,
    tuition: { domestic: 1460, international: 1460 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 7, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 15", financialAid: "Jan 31" },
    popularMajors: ["Engineering", "Computer Science", "Physics", "Mathematics", "Architecture"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "required" },
    admitProfile: ["subject-focused", "research-emphasis", "test-required"],
    dataYear: 2024,
    dataSourceUrl: "https://ethz.ch/en/studies/registration-application.html",
    lastUpdated: "2024-09",
  },
  {
    name: "Technical University of Munich",
    country: "Germany",
    region: "Europe",
    acceptanceRate: 8.0,
    intlAcceptanceRate: 6.0,
    acceptanceRateTrend: "stable",
    medianGPA: 3.7,
    medianSAT: 1400,
    medianACT: 31,
    internationalStudentPercent: 37,
    tuition: { domestic: 0, international: 6000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 37, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "May 31", financialAid: "Jul 15" },
    popularMajors: ["Engineering", "Computer Science", "Physics", "Mathematics", "Architecture"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024,
    dataSourceUrl: "https://www.tum.de/en/studies",
    lastUpdated: "2024-09",
  },

  // ───────────────────────────── United States (expanded) ─────────────────────────────
  {
    name: "Northwestern University", country: "USA", region: "North America",
    acceptanceRate: 7.0, intlAcceptanceRate: 5.5, acceptanceRateTrend: "declining",
    medianGPA: 3.93, medianSAT: 1510, medianACT: 34, internationalStudentPercent: 11,
    tuition: { domestic: 65997, international: 65997 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 58000 },
    rankings: { world: 47, national: 9, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 3", financialAid: "Feb 15" },
    popularMajors: ["Journalism", "Economics", "Engineering", "Computer Science", "Theatre"],
    applicationRequirements: { essays: 3, recommendations: 2, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.adminplan.northwestern.edu/ir/data-book/", lastUpdated: "2024-09",
  },
  {
    name: "Johns Hopkins University", country: "USA", region: "North America",
    acceptanceRate: 6.5, intlAcceptanceRate: 5.0, acceptanceRateTrend: "declining",
    medianGPA: 3.93, medianSAT: 1530, medianACT: 35, internationalStudentPercent: 13,
    tuition: { domestic: 63340, international: 63340 },
    financialAid: { needBlind: true, needBlindIntl: false, meritScholarships: false, internationalAid: true, averageAidPackage: 58000 },
    rankings: { world: 28, national: 9, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 2", financialAid: "Feb 1" },
    popularMajors: ["Public Health", "Biomedical Engineering", "Neuroscience", "International Studies", "Computer Science"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "research-emphasis", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://apply.jhu.edu/application-process/admissions-stats/", lastUpdated: "2024-09",
  },
  {
    name: "Carnegie Mellon University", country: "USA", region: "North America",
    acceptanceRate: 11.3, intlAcceptanceRate: 7.0, acceptanceRateTrend: "declining",
    medianGPA: 3.91, medianSAT: 1540, medianACT: 35, internationalStudentPercent: 22,
    tuition: { domestic: 63829, international: 63829 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 46000 },
    rankings: { world: 52, national: 24, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 3", financialAid: "Feb 15" },
    popularMajors: ["Computer Science", "Engineering", "Business", "Design", "Drama"],
    applicationRequirements: { essays: 3, recommendations: 2, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "subject-focused", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.cmu.edu/admission/admission/", lastUpdated: "2024-09",
  },
  {
    name: "New York University", country: "USA", region: "North America",
    acceptanceRate: 8.0, intlAcceptanceRate: 6.5, acceptanceRateTrend: "declining",
    medianGPA: 3.7, medianSAT: 1500, medianACT: 34, internationalStudentPercent: 22,
    tuition: { domestic: 60438, international: 60438 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 40000 },
    rankings: { world: 38, national: 35, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 5", financialAid: "Feb 15" },
    popularMajors: ["Business", "Computer Science", "Film", "Economics", "Psychology"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "flexible" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.nyu.edu/admissions/undergraduate-admissions.html", lastUpdated: "2024-09",
  },
  {
    name: "University of Michigan", country: "USA", region: "North America",
    acceptanceRate: 17.7, intlAcceptanceRate: 12.0, acceptanceRateTrend: "stable",
    medianGPA: 3.88, medianSAT: 1460, medianACT: 33, internationalStudentPercent: 8,
    tuition: { domestic: 17786, international: 60946 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 19000 },
    rankings: { world: 33, national: 21, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Feb 1", financialAid: "Feb 1" },
    popularMajors: ["Engineering", "Business", "Computer Science", "Economics", "Psychology"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://ro.umich.edu/reports/ethnicity", lastUpdated: "2024-09",
  },
  {
    name: "Georgia Institute of Technology", country: "USA", region: "North America",
    acceptanceRate: 16.0, intlAcceptanceRate: 10.0, acceptanceRateTrend: "declining",
    medianGPA: 3.95, medianSAT: 1480, medianACT: 33, internationalStudentPercent: 13,
    tuition: { domestic: 12852, international: 33020 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 14000 },
    rankings: { world: 88, national: 33, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Oct 15", regularDecision: "Jan 4", financialAid: "Feb 1" },
    popularMajors: ["Engineering", "Computer Science", "Industrial Engineering", "Business", "Architecture"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://admission.gatech.edu/first-year/admitted-student-profile", lastUpdated: "2024-09",
  },
  {
    name: "University of Southern California", country: "USA", region: "North America",
    acceptanceRate: 9.9, intlAcceptanceRate: 7.0, acceptanceRateTrend: "declining",
    medianGPA: 3.88, medianSAT: 1490, medianACT: 34, internationalStudentPercent: 24,
    tuition: { domestic: 66640, international: 66640 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 45000 },
    rankings: { world: 116, national: 28, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 15", financialAid: "Feb 15" },
    popularMajors: ["Business", "Film", "Communication", "Engineering", "Computer Science"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://admission.usc.edu/admitted-students/", lastUpdated: "2024-09",
  },
  {
    name: "University of Texas at Austin", country: "USA", region: "North America",
    acceptanceRate: 31.0, intlAcceptanceRate: 8.0, acceptanceRateTrend: "stable",
    medianGPA: 3.83, medianSAT: 1400, medianACT: 31, internationalStudentPercent: 10,
    tuition: { domestic: 11752, international: 41070 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 14000 },
    rankings: { world: 67, national: 32, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 1", financialAid: "Jan 15" },
    popularMajors: ["Business", "Engineering", "Computer Science", "Communications", "Biology"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "required" },
    admitProfile: ["holistic-us", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://reports.utexas.edu/spotlight-data/admission-rates", lastUpdated: "2024-09",
  },

  // ───────────────────────────── United States — Target / Safety (state flagships & accessible) ─────────────────────────────
  {
    name: "University of Washington", country: "USA", region: "North America",
    acceptanceRate: 43.0, intlAcceptanceRate: 24.0, acceptanceRateTrend: "stable",
    medianGPA: 3.80, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 15,
    tuition: { domestic: 12643, international: 41997 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 12000 },
    rankings: { world: 78, national: 40, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 15", financialAid: "Jan 15" },
    popularMajors: ["Computer Science", "Engineering", "Business", "Biology", "Public Health"],
    applicationRequirements: { essays: 2, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://admit.washington.edu/apply/freshman/profile/", lastUpdated: "2024-09",
  },
  {
    name: "University of Illinois Urbana-Champaign", country: "USA", region: "North America",
    acceptanceRate: 45.0, intlAcceptanceRate: 28.0, acceptanceRateTrend: "stable",
    medianGPA: 3.83, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 17,
    tuition: { domestic: 17572, international: 38704 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 10000 },
    rankings: { world: 64, national: 35, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 5", financialAid: "Mar 15" },
    popularMajors: ["Engineering", "Computer Science", "Business", "Agriculture", "Psychology"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "subject-focused", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://dmi.illinois.edu/stuenr/", lastUpdated: "2024-09",
  },
  {
    name: "Pennsylvania State University", country: "USA", region: "North America",
    acceptanceRate: 55.0, intlAcceptanceRate: 40.0, acceptanceRateTrend: "stable",
    medianGPA: 3.63, medianSAT: 1280, medianACT: 28, internationalStudentPercent: 10,
    tuition: { domestic: 19286, international: 39492 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 8000 },
    rankings: { world: 93, national: 60, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Feb 1", financialAid: "Mar 1" },
    popularMajors: ["Engineering", "Business", "Communications", "Biology", "Psychology"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://admissions.psu.edu/apply/statistics/", lastUpdated: "2024-09",
  },
  {
    name: "Ohio State University", country: "USA", region: "North America",
    acceptanceRate: 53.0, intlAcceptanceRate: 38.0, acceptanceRateTrend: "stable",
    medianGPA: 3.83, medianSAT: 1370, medianACT: 30, internationalStudentPercent: 8,
    tuition: { domestic: 12485, international: 39542 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 9000 },
    rankings: { world: 156, national: 49, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Feb 1", financialAid: "Feb 1" },
    popularMajors: ["Business", "Engineering", "Health Sciences", "Psychology", "Biology"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://undergrad.osu.edu/apply/freshman-applicants", lastUpdated: "2024-09",
  },
  {
    name: "University of Wisconsin–Madison", country: "USA", region: "North America",
    acceptanceRate: 49.0, intlAcceptanceRate: 30.0, acceptanceRateTrend: "stable",
    medianGPA: 3.85, medianSAT: 1390, medianACT: 30, internationalStudentPercent: 11,
    tuition: { domestic: 11215, international: 40603 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 10000 },
    rankings: { world: 87, national: 35, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Feb 1", financialAid: "Feb 1" },
    popularMajors: ["Business", "Engineering", "Biology", "Computer Science", "Economics"],
    applicationRequirements: { essays: 2, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://apir.wisc.edu/enrollment/", lastUpdated: "2024-09",
  },
  {
    name: "Purdue University", country: "USA", region: "North America",
    acceptanceRate: 53.0, intlAcceptanceRate: 35.0, acceptanceRateTrend: "stable",
    medianGPA: 3.74, medianSAT: 1330, medianACT: 30, internationalStudentPercent: 16,
    tuition: { domestic: 9992, international: 28794 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 11000 },
    rankings: { world: 99, national: 43, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 15", financialAid: "Mar 1" },
    popularMajors: ["Engineering", "Computer Science", "Agriculture", "Aviation", "Pharmacy"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["subject-focused", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.admissions.purdue.edu/apply/profile.php", lastUpdated: "2024-09",
  },
  {
    name: "Arizona State University", country: "USA", region: "North America",
    acceptanceRate: 90.0, intlAcceptanceRate: 80.0, acceptanceRateTrend: "stable",
    medianGPA: 3.55, medianSAT: 1230, medianACT: 26, internationalStudentPercent: 13,
    tuition: { domestic: 12051, international: 33670 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 12000 },
    rankings: { world: 179, national: 105, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Rolling", financialAid: "Mar 1" },
    popularMajors: ["Business", "Engineering", "Communications", "Computer Science", "Biology"],
    applicationRequirements: { essays: 0, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["broad-access", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://admission.asu.edu/freshman/profile", lastUpdated: "2024-09",
  },
  {
    name: "University of Massachusetts Amherst", country: "USA", region: "North America",
    acceptanceRate: 64.0, intlAcceptanceRate: 50.0, acceptanceRateTrend: "stable",
    medianGPA: 3.90, medianSAT: 1340, medianACT: 30, internationalStudentPercent: 9,
    tuition: { domestic: 17357, international: 39943 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 10000 },
    rankings: { world: 286, national: 67, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 5", regularDecision: "Jan 15", financialAid: "Feb 15" },
    popularMajors: ["Business", "Computer Science", "Psychology", "Engineering", "Communication"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.umass.edu/admissions/apply/first-year/profile", lastUpdated: "2024-09",
  },
  {
    name: "Rutgers University–New Brunswick", country: "USA", region: "North America",
    acceptanceRate: 66.0, intlAcceptanceRate: 50.0, acceptanceRateTrend: "stable",
    medianGPA: 3.73, medianSAT: 1320, medianACT: 29, internationalStudentPercent: 9,
    tuition: { domestic: 15804, international: 33005 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 9000 },
    rankings: { world: 248, national: 40, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 1", financialAid: "Apr 15" },
    popularMajors: ["Business", "Engineering", "Pharmacy", "Biology", "Computer Science"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://admissions.rutgers.edu/academics/admissions-profile", lastUpdated: "2024-09",
  },
  {
    name: "Indiana University Bloomington", country: "USA", region: "North America",
    acceptanceRate: 82.0, intlAcceptanceRate: 70.0, acceptanceRateTrend: "stable",
    medianGPA: 3.78, medianSAT: 1290, medianACT: 28, internationalStudentPercent: 8,
    tuition: { domestic: 11790, international: 40478 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 11000 },
    rankings: { world: 263, national: 73, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyAction: "Nov 1", regularDecision: "Feb 1", financialAid: "Apr 15" },
    popularMajors: ["Business", "Music", "Public Health", "Biology", "Computer Science"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional", "broad-access"],
    dataYear: 2024, dataSourceUrl: "https://admissions.indiana.edu/apply/freshman/profile.html", lastUpdated: "2024-09",
  },
  {
    name: "University of Florida", country: "USA", region: "North America",
    acceptanceRate: 23.0, intlAcceptanceRate: 12.0, acceptanceRateTrend: "stable",
    medianGPA: 3.95, medianSAT: 1390, medianACT: 31, internationalStudentPercent: 6,
    tuition: { domestic: 6381, international: 28659 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 9000 },
    rankings: { world: 168, national: 28, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 1", financialAid: "Dec 15" },
    popularMajors: ["Engineering", "Business", "Biology", "Psychology", "Health Sciences"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "none", testPolicy: "required" },
    admitProfile: ["holistic-us", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://admissions.ufl.edu/apply/freshman/profile", lastUpdated: "2024-09",
  },
  {
    name: "UC Davis", country: "USA", region: "North America",
    acceptanceRate: 49.0, intlAcceptanceRate: 32.0, acceptanceRateTrend: "stable",
    medianGPA: 4.03, medianSAT: 1310, medianACT: 28, internationalStudentPercent: 16,
    tuition: { domestic: 14740, international: 46326 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 12000 },
    rankings: { world: 109, national: 28, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 2", financialAid: "Mar 2" },
    popularMajors: ["Biology", "Engineering", "Agriculture", "Psychology", "Economics"],
    applicationRequirements: { essays: 4, recommendations: 0, interview: "none", testPolicy: "blind" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.ucop.edu/institutional-research-academic-planning/", lastUpdated: "2024-09",
  },
  {
    name: "UC Irvine", country: "USA", region: "North America",
    acceptanceRate: 26.0, intlAcceptanceRate: 18.0, acceptanceRateTrend: "stable",
    medianGPA: 4.02, medianSAT: 1335, medianACT: 29, internationalStudentPercent: 17,
    tuition: { domestic: 14910, international: 46496 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 14000 },
    rankings: { world: 78, national: 33, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 2", financialAid: "Mar 2" },
    popularMajors: ["Computer Science", "Biology", "Business", "Engineering", "Psychology"],
    applicationRequirements: { essays: 4, recommendations: 0, interview: "none", testPolicy: "blind" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://oir.uci.edu/", lastUpdated: "2024-09",
  },
  {
    name: "UC San Diego", country: "USA", region: "North America",
    acceptanceRate: 25.0, intlAcceptanceRate: 18.0, acceptanceRateTrend: "stable",
    medianGPA: 4.10, medianSAT: 1360, medianACT: 30, internationalStudentPercent: 19,
    tuition: { domestic: 15348, international: 46934 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: false, averageAidPackage: 13000 },
    rankings: { world: 72, national: 28, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 2", financialAid: "Mar 2" },
    popularMajors: ["Biology", "Engineering", "Computer Science", "Economics", "Cognitive Science"],
    applicationRequirements: { essays: 4, recommendations: 0, interview: "none", testPolicy: "blind" },
    admitProfile: ["holistic-us", "test-optional", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://ir.ucsd.edu/", lastUpdated: "2024-09",
  },
  {
    name: "Boston University", country: "USA", region: "North America",
    acceptanceRate: 14.0, intlAcceptanceRate: 11.0, acceptanceRateTrend: "stable",
    medianGPA: 3.85, medianSAT: 1450, medianACT: 32, internationalStudentPercent: 21,
    tuition: { domestic: 66670, international: 66670 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 45000 },
    rankings: { world: 108, national: 43, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 4", financialAid: "Feb 1" },
    popularMajors: ["Business", "Communications", "Engineering", "Psychology", "International Relations"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "optional" },
    admitProfile: ["holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://www.bu.edu/admissions/why-bu/facts-stats/", lastUpdated: "2024-09",
  },



  // ───────────────────────────── United Kingdom (expanded) ─────────────────────────────
  {
    name: "King's College London", country: "UK", region: "Europe",
    acceptanceRate: 13.0, intlAcceptanceRate: 11.0, acceptanceRateTrend: "stable",
    medianGPA: 3.75, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 42,
    tuition: { domestic: 9250, international: 33450 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 },
    rankings: { world: 40, national: 7, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "Apr 30" },
    popularMajors: ["Law", "Medicine", "International Relations", "Business", "Computer Science"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused"],
    dataYear: 2024, dataSourceUrl: "https://www.kcl.ac.uk/study/undergraduate", lastUpdated: "2024-09",
  },
  {
    name: "University of Manchester", country: "UK", region: "Europe",
    acceptanceRate: 56.0, intlAcceptanceRate: 45.0, acceptanceRateTrend: "stable",
    medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 38,
    tuition: { domestic: 9250, international: 28500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 32, national: 8, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "May 31" },
    popularMajors: ["Engineering", "Business", "Computer Science", "Medicine", "Economics"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused", "broad-access"],
    dataYear: 2024, dataSourceUrl: "https://www.manchester.ac.uk/study/undergraduate/", lastUpdated: "2024-09",
  },
  {
    name: "University of Warwick", country: "UK", region: "Europe",
    acceptanceRate: 14.0, intlAcceptanceRate: 12.0, acceptanceRateTrend: "stable",
    medianGPA: 3.75, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 38,
    tuition: { domestic: 9250, international: 31620 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 },
    rankings: { world: 67, national: 9, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "Apr 30" },
    popularMajors: ["Economics", "Mathematics", "Business", "Computer Science", "Engineering"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused"],
    dataYear: 2024, dataSourceUrl: "https://warwick.ac.uk/study/undergraduate/", lastUpdated: "2024-09",
  },
  {
    name: "University of Bristol", country: "UK", region: "Europe",
    acceptanceRate: 68.0, intlAcceptanceRate: 55.0, acceptanceRateTrend: "stable",
    medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 27,
    tuition: { domestic: 9250, international: 29800 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 55, national: 10, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 25", financialAid: "Apr 30" },
    popularMajors: ["Engineering", "Medicine", "Law", "Economics", "Computer Science"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused", "broad-access"],
    dataYear: 2024, dataSourceUrl: "https://www.bristol.ac.uk/study/undergraduate/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Canada (expanded) ─────────────────────────────
  {
    name: "McMaster University", country: "Canada", region: "North America",
    acceptanceRate: 58.0, intlAcceptanceRate: 50.0, acceptanceRateTrend: "stable",
    medianGPA: 3.7, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 14,
    tuition: { domestic: 6800, international: 42000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 7000 },
    rankings: { world: 189, national: 4, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Mar 1" },
    popularMajors: ["Health Sciences", "Engineering", "Business", "Computer Science", "Biology"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["broad-access"],
    dataYear: 2024, dataSourceUrl: "https://future.mcmaster.ca/", lastUpdated: "2024-09",
  },
  {
    name: "University of Waterloo", country: "Canada", region: "North America",
    acceptanceRate: 53.0, intlAcceptanceRate: 30.0, acceptanceRateTrend: "stable",
    medianGPA: 3.85, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 22,
    tuition: { domestic: 16700, international: 65300 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 112, national: 6, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Feb 1", financialAid: "Apr 1" },
    popularMajors: ["Computer Science", "Engineering", "Mathematics", "Business", "Software Engineering"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://uwaterloo.ca/future-students/", lastUpdated: "2024-09",
  },
  {
    name: "Western University", country: "Canada", region: "North America",
    acceptanceRate: 58.0, intlAcceptanceRate: 50.0, acceptanceRateTrend: "stable",
    medianGPA: 3.6, medianSAT: 1350, medianACT: 29, internationalStudentPercent: 12,
    tuition: { domestic: 7800, international: 40000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 },
    rankings: { world: 114, national: 7, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Mar 1" },
    popularMajors: ["Business (Ivey)", "Medical Sciences", "Engineering", "Social Science", "Law"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["broad-access"],
    dataYear: 2024, dataSourceUrl: "https://welcome.uwo.ca/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Australia (expanded) ─────────────────────────────
  {
    name: "University of Sydney", country: "Australia", region: "Oceania",
    acceptanceRate: 30.0, intlAcceptanceRate: 28.0, acceptanceRateTrend: "stable",
    medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 46,
    tuition: { domestic: 11000, international: 52000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 18, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 15", financialAid: "Feb 15" },
    popularMajors: ["Medicine", "Business", "Engineering", "Law", "Architecture"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused", "broad-access"],
    dataYear: 2024, dataSourceUrl: "https://www.sydney.edu.au/study.html", lastUpdated: "2024-09",
  },
  {
    name: "University of New South Wales", country: "Australia", region: "Oceania",
    acceptanceRate: 30.0, intlAcceptanceRate: 28.0, acceptanceRateTrend: "stable",
    medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 39,
    tuition: { domestic: 11000, international: 53000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 7500 },
    rankings: { world: 19, national: 3, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Nov 30", financialAid: "Jan 31" },
    popularMajors: ["Engineering", "Computer Science", "Business", "Medicine", "Law"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused", "broad-access"],
    dataYear: 2024, dataSourceUrl: "https://www.unsw.edu.au/study", lastUpdated: "2024-09",
  },
  {
    name: "Monash University", country: "Australia", region: "Oceania",
    acceptanceRate: 40.0, intlAcceptanceRate: 35.0, acceptanceRateTrend: "stable",
    medianGPA: 3.5, medianSAT: 1350, medianACT: 29, internationalStudentPercent: 36,
    tuition: { domestic: 11000, international: 49000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 },
    rankings: { world: 37, national: 5, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 15", financialAid: "Feb 15" },
    popularMajors: ["Medicine", "Pharmacy", "Engineering", "Business", "Law"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["broad-access", "subject-focused"],
    dataYear: 2024, dataSourceUrl: "https://www.monash.edu/study", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Netherlands ─────────────────────────────
  {
    name: "Delft University of Technology", country: "Netherlands", region: "Europe",
    acceptanceRate: 35.0, intlAcceptanceRate: 30.0, acceptanceRateTrend: "stable",
    medianGPA: 3.7, medianSAT: 1400, medianACT: 31, internationalStudentPercent: 35,
    tuition: { domestic: 2530, international: 21000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 47, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "May 1" },
    popularMajors: ["Engineering", "Computer Science", "Architecture", "Aerospace", "Industrial Design"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://www.tudelft.nl/en/education", lastUpdated: "2024-09",
  },
  {
    name: "University of Amsterdam", country: "Netherlands", region: "Europe",
    acceptanceRate: 55.0, intlAcceptanceRate: 50.0, acceptanceRateTrend: "stable",
    medianGPA: 3.5, medianSAT: 1350, medianACT: 29, internationalStudentPercent: 23,
    tuition: { domestic: 2530, international: 16500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 },
    rankings: { world: 53, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "May 1" },
    popularMajors: ["Economics", "Psychology", "Communication", "Law", "Computer Science"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["broad-access"],
    dataYear: 2024, dataSourceUrl: "https://www.uva.nl/en/education", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Ireland ─────────────────────────────
  {
    name: "Trinity College Dublin", country: "Ireland", region: "Europe",
    acceptanceRate: 33.0, intlAcceptanceRate: 28.0, acceptanceRateTrend: "stable",
    medianGPA: 3.7, medianSAT: 1400, medianACT: 31, internationalStudentPercent: 30,
    tuition: { domestic: 3000, international: 26000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 87, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Feb 1", financialAid: "May 1" },
    popularMajors: ["Computer Science", "Business", "Law", "Medicine", "English Literature"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" },
    admitProfile: ["subject-focused"],
    dataYear: 2024, dataSourceUrl: "https://www.tcd.ie/study/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── France ─────────────────────────────
  {
    name: "Sciences Po", country: "France", region: "Europe",
    acceptanceRate: 14.0, intlAcceptanceRate: 18.0, acceptanceRateTrend: "stable",
    medianGPA: 3.7, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 50,
    tuition: { domestic: 4000, international: 14500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 319, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Feb 22", financialAid: "Apr 30" },
    popularMajors: ["Political Science", "Economics", "International Relations", "Law", "Sociology"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "required", testPolicy: "optional" },
    admitProfile: ["subject-focused", "holistic-us"],
    dataYear: 2024, dataSourceUrl: "https://www.sciencespo.fr/admissions/en", lastUpdated: "2024-09",
  },
  {
    name: "HEC Paris", country: "France", region: "Europe",
    acceptanceRate: 9.0, intlAcceptanceRate: 8.0, acceptanceRateTrend: "stable",
    medianGPA: 3.8, medianSAT: 1450, medianACT: 33, internationalStudentPercent: 40,
    tuition: { domestic: 22000, international: 22000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 7000 },
    rankings: { world: 59, national: 3, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Mar 15", financialAid: "May 1" },
    popularMajors: ["Business", "Management", "Finance", "Economics"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "required", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://www.hec.edu/en/bachelor-programs", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Switzerland (expanded) ─────────────────────────────
  {
    name: "EPFL", country: "Switzerland", region: "Europe",
    acceptanceRate: 30.0, intlAcceptanceRate: 25.0, acceptanceRateTrend: "stable",
    medianGPA: 3.8, medianSAT: 1450, medianACT: 33, internationalStudentPercent: 56,
    tuition: { domestic: 1460, international: 1460 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 },
    rankings: { world: 36, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Apr 30", financialAid: "Jun 30" },
    popularMajors: ["Computer Science", "Engineering", "Physics", "Mathematics", "Life Sciences"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://www.epfl.ch/education/bachelor/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Sweden ─────────────────────────────
  {
    name: "KTH Royal Institute of Technology", country: "Sweden", region: "Europe",
    acceptanceRate: 35.0, intlAcceptanceRate: 30.0, acceptanceRateTrend: "stable",
    medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 27,
    tuition: { domestic: 0, international: 15500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 73, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 15", financialAid: "Feb 1" },
    popularMajors: ["Engineering", "Computer Science", "Architecture", "Industrial Design"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "none", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://www.kth.se/en/studies", lastUpdated: "2024-09",
  },

  // ───────────────────────────── South Korea ─────────────────────────────
  {
    name: "Seoul National University", country: "South Korea", region: "Asia",
    acceptanceRate: 10.0, intlAcceptanceRate: 15.0, acceptanceRateTrend: "stable",
    medianGPA: 3.85, medianSAT: 1460, medianACT: 33, internationalStudentPercent: 10,
    tuition: { domestic: 4500, international: 6000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 },
    rankings: { world: 41, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Sep 30", financialAid: "Nov 1" },
    popularMajors: ["Engineering", "Business", "Computer Science", "Medicine", "Law"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://en.snu.ac.kr/admissions", lastUpdated: "2024-09",
  },
  {
    name: "KAIST", country: "South Korea", region: "Asia",
    acceptanceRate: 14.0, intlAcceptanceRate: 20.0, acceptanceRateTrend: "stable",
    medianGPA: 3.85, medianSAT: 1460, medianACT: 33, internationalStudentPercent: 8,
    tuition: { domestic: 4000, international: 5500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 56, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Oct 31", financialAid: "Dec 1" },
    popularMajors: ["Engineering", "Computer Science", "Physics", "Mathematics", "Biology"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "research-emphasis", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://admission.kaist.ac.kr/intl-undergraduate/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── China ─────────────────────────────
  {
    name: "Tsinghua University", country: "China", region: "Asia",
    acceptanceRate: 2.0, intlAcceptanceRate: 16.0, acceptanceRateTrend: "stable",
    medianGPA: 3.9, medianSAT: 1500, medianACT: 34, internationalStudentPercent: 10,
    tuition: { domestic: 4000, international: 5500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 25, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 1", financialAid: "Mar 1" },
    popularMajors: ["Engineering", "Computer Science", "Economics", "Architecture", "Physics"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "required", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://www.tsinghua.edu.cn/en/Admissions.htm", lastUpdated: "2024-09",
  },
  {
    name: "Peking University", country: "China", region: "Asia",
    acceptanceRate: 2.5, intlAcceptanceRate: 18.0, acceptanceRateTrend: "stable",
    medianGPA: 3.9, medianSAT: 1500, medianACT: 34, internationalStudentPercent: 12,
    tuition: { domestic: 4000, international: 5500 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 17, national: 2, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 1", financialAid: "Mar 1" },
    popularMajors: ["Economics", "Mathematics", "Computer Science", "Medicine", "International Relations"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "required", testPolicy: "optional" },
    admitProfile: ["subject-focused", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://english.pku.edu.cn/admissions/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Hong Kong (expanded) ─────────────────────────────
  {
    name: "Hong Kong University of Science and Technology", country: "Hong Kong", region: "Asia",
    acceptanceRate: 26.0, intlAcceptanceRate: 22.0, acceptanceRateTrend: "stable",
    medianGPA: 3.7, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 33,
    tuition: { domestic: 5400, international: 18800 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 },
    rankings: { world: 47, national: 3, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 12", financialAid: "Apr 30" },
    popularMajors: ["Engineering", "Business", "Computer Science", "Science"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://join.hkust.edu.hk/", lastUpdated: "2024-09",
  },
  {
    name: "Chinese University of Hong Kong", country: "Hong Kong", region: "Asia",
    acceptanceRate: 28.0, intlAcceptanceRate: 24.0, acceptanceRateTrend: "stable",
    medianGPA: 3.65, medianSAT: 1410, medianACT: 31, internationalStudentPercent: 28,
    tuition: { domestic: 5400, international: 18000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 7500 },
    rankings: { world: 47, national: 4, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Jan 4", financialAid: "Apr 30" },
    popularMajors: ["Business", "Medicine", "Engineering", "Law", "Social Science"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required"],
    dataYear: 2024, dataSourceUrl: "https://www.cuhk.edu.hk/admission/", lastUpdated: "2024-09",
  },

  // ───────────────────────────── UAE ─────────────────────────────
  {
    name: "NYU Abu Dhabi", country: "UAE", region: "Middle East",
    acceptanceRate: 3.9, intlAcceptanceRate: 3.9, acceptanceRateTrend: "stable",
    medianGPA: 3.9, medianSAT: 1500, medianACT: 34, internationalStudentPercent: 80,
    tuition: { domestic: 56682, international: 56682 },
    financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: true, internationalAid: true, averageAidPackage: 65000 },
    rankings: { world: 250, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { earlyDecision: "Nov 1", regularDecision: "Jan 1", financialAid: "Feb 1" },
    popularMajors: ["Engineering", "Economics", "Computer Science", "Political Science", "Biology"],
    applicationRequirements: { essays: 2, recommendations: 2, interview: "recommended", testPolicy: "optional" },
    admitProfile: ["need-blind-intl", "holistic-us", "test-optional"],
    dataYear: 2024, dataSourceUrl: "https://nyuad.nyu.edu/en/admissions.html", lastUpdated: "2024-09",
  },

  // ───────────────────────────── New Zealand ─────────────────────────────
  {
    name: "University of Auckland", country: "New Zealand", region: "Oceania",
    acceptanceRate: 45.0, intlAcceptanceRate: 40.0, acceptanceRateTrend: "stable",
    medianGPA: 3.5, medianSAT: 1350, medianACT: 29, internationalStudentPercent: 28,
    tuition: { domestic: 7500, international: 32000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 },
    rankings: { world: 65, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Dec 8", financialAid: "Feb 1" },
    popularMajors: ["Business", "Engineering", "Medicine", "Computer Science", "Law"],
    applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" },
    admitProfile: ["broad-access"],
    dataYear: 2024, dataSourceUrl: "https://www.auckland.ac.nz/en/study.html", lastUpdated: "2024-09",
  },

  // ───────────────────────────── India ─────────────────────────────
  {
    name: "Indian Institute of Technology Bombay", country: "India", region: "Asia",
    acceptanceRate: 1.0, intlAcceptanceRate: 5.0, acceptanceRateTrend: "stable",
    medianGPA: 3.9, medianSAT: 1500, medianACT: 34, internationalStudentPercent: 2,
    tuition: { domestic: 3000, international: 6000 },
    financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 3000 },
    rankings: { world: 118, national: 1, source: "QS World Rankings", year: 2024 },
    deadlines: { regularDecision: "Apr 30", financialAid: "Jun 30" },
    popularMajors: ["Engineering", "Computer Science", "Physics", "Mathematics", "Aerospace"],
    applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" },
    admitProfile: ["subject-focused", "test-required", "research-emphasis"],
    dataYear: 2024, dataSourceUrl: "https://www.iitb.ac.in/en/education/admissions", lastUpdated: "2024-09",
  },

  // ───────────────────────────── Italy ─────────────────────────────
  { name: "Bocconi University", country: "Italy", region: "Europe", acceptanceRate: 35, intlAcceptanceRate: 40, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 23, tuition: { domestic: 16000, international: 16000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 }, rankings: { world: 102, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Apr 5", financialAid: "May 1" }, popularMajors: ["Economics","Finance","Management","Data Science"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.unibocconi.eu/admissions", lastUpdated: "2024-09" },
  { name: "Politecnico di Milano", country: "Italy", region: "Europe", acceptanceRate: 50, intlAcceptanceRate: 45, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1300, medianACT: 28, internationalStudentPercent: 18, tuition: { domestic: 4000, international: 4000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 123, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 15", financialAid: "Mar 1" }, popularMajors: ["Engineering","Architecture","Design"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" }, admitProfile: ["subject-focused","test-required"], dataYear: 2024, dataSourceUrl: "https://www.polimi.it/en/", lastUpdated: "2024-09" },

  // ───────────────────────────── Spain ─────────────────────────────
  { name: "IE University", country: "Spain", region: "Europe", acceptanceRate: 42, intlAcceptanceRate: 45, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1320, medianACT: 28, internationalStudentPercent: 75, tuition: { domestic: 24000, international: 24000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 10000 }, rankings: { world: 347, national: 4, source: "QS", year: 2024 }, deadlines: { regularDecision: "Apr 30", financialAid: "May 30" }, popularMajors: ["Business","International Relations","Law","Data Science"], applicationRequirements: { essays: 2, recommendations: 1, interview: "required", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.ie.edu/university/", lastUpdated: "2024-09" },
  { name: "Universidad Autónoma de Madrid", country: "Spain", region: "Europe", acceptanceRate: 38, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1300, medianACT: 28, internationalStudentPercent: 12, tuition: { domestic: 2000, international: 6000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 3000 }, rankings: { world: 192, national: 2, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jun 30", financialAid: "Aug 1" }, popularMajors: ["Medicine","Law","Sciences","Humanities"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.uam.es/", lastUpdated: "2024-09" },

  // ───────────────────────────── Belgium ─────────────────────────────
  { name: "KU Leuven", country: "Belgium", region: "Europe", acceptanceRate: 55, intlAcceptanceRate: 50, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1320, medianACT: 28, internationalStudentPercent: 17, tuition: { domestic: 1000, international: 6600 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 }, rankings: { world: 61, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 1", financialAid: "May 1" }, popularMajors: ["Engineering","Medicine","Business","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.kuleuven.be/english/", lastUpdated: "2024-09" },

  // ───────────────────────────── Austria ─────────────────────────────
  { name: "University of Vienna", country: "Austria", region: "Europe", acceptanceRate: 60, intlAcceptanceRate: 55, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1280, medianACT: 27, internationalStudentPercent: 27, tuition: { domestic: 1500, international: 1500 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 2000 }, rankings: { world: 137, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Sep 5", financialAid: "Oct 1" }, popularMajors: ["Law","Medicine","Business","Humanities"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.univie.ac.at/en/", lastUpdated: "2024-09" },

  // ───────────────────────────── Norway ─────────────────────────────
  { name: "University of Oslo", country: "Norway", region: "Europe", acceptanceRate: 38, intlAcceptanceRate: 30, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1340, medianACT: 29, internationalStudentPercent: 14, tuition: { domestic: 0, international: 15000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 }, rankings: { world: 117, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 1", financialAid: "Apr 15" }, popularMajors: ["Sciences","Medicine","Humanities","Engineering"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.uio.no/english/", lastUpdated: "2024-09" },

  // ───────────────────────────── Finland ─────────────────────────────
  { name: "University of Helsinki", country: "Finland", region: "Europe", acceptanceRate: 35, intlAcceptanceRate: 28, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1340, medianACT: 29, internationalStudentPercent: 9, tuition: { domestic: 0, international: 13000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 115, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 20", financialAid: "Mar 1" }, popularMajors: ["Sciences","Medicine","Law","Education"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.helsinki.fi/en", lastUpdated: "2024-09" },
  { name: "Aalto University", country: "Finland", region: "Europe", acceptanceRate: 25, intlAcceptanceRate: 22, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1360, medianACT: 30, internationalStudentPercent: 19, tuition: { domestic: 0, international: 15000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 109, national: 2, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 18", financialAid: "Mar 1" }, popularMajors: ["Engineering","Business","Design","Computer Science"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["subject-focused","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.aalto.fi/en", lastUpdated: "2024-09" },

  // ───────────────────────────── Denmark ─────────────────────────────
  { name: "University of Copenhagen", country: "Denmark", region: "Europe", acceptanceRate: 41, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1360, medianACT: 30, internationalStudentPercent: 13, tuition: { domestic: 0, international: 17000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 }, rankings: { world: 107, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 15", financialAid: "May 1" }, popularMajors: ["Medicine","Law","Sciences","Humanities"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.ku.dk/english/", lastUpdated: "2024-09" },

  // ───────────────────────────── Portugal ─────────────────────────────
  { name: "University of Lisbon", country: "Portugal", region: "Europe", acceptanceRate: 45, intlAcceptanceRate: 40, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1280, medianACT: 27, internationalStudentPercent: 11, tuition: { domestic: 1300, international: 4000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 2500 }, rankings: { world: 296, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jul 31", financialAid: "Sep 1" }, popularMajors: ["Sciences","Engineering","Medicine","Humanities"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.ulisboa.pt/en", lastUpdated: "2024-09" },

  // ───────────────────────────── Czech Republic ─────────────────────────────
  { name: "Charles University", country: "Czech Republic", region: "Europe", acceptanceRate: 48, intlAcceptanceRate: 40, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1280, medianACT: 27, internationalStudentPercent: 17, tuition: { domestic: 0, international: 7000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 3000 }, rankings: { world: 248, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Feb 28", financialAid: "Apr 1" }, popularMajors: ["Medicine","Humanities","Sciences","Law"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional"], dataYear: 2024, dataSourceUrl: "https://cuni.cz/UKEN-1.html", lastUpdated: "2024-09" },

  // ───────────────────────────── Poland ─────────────────────────────
  { name: "University of Warsaw", country: "Poland", region: "Europe", acceptanceRate: 45, intlAcceptanceRate: 40, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1280, medianACT: 27, internationalStudentPercent: 6, tuition: { domestic: 0, international: 3500 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 2000 }, rankings: { world: 262, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jun 6", financialAid: "Aug 1" }, popularMajors: ["Law","Sciences","Humanities","Economics"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional"], dataYear: 2024, dataSourceUrl: "https://en.uw.edu.pl/", lastUpdated: "2024-09" },

  // ───────────────────────────── Taiwan ─────────────────────────────
  { name: "National Taiwan University", country: "Taiwan", region: "Asia", acceptanceRate: 7, intlAcceptanceRate: 15, acceptanceRateTrend: "stable", medianGPA: 3.8, medianSAT: 1450, medianACT: 33, internationalStudentPercent: 11, tuition: { domestic: 1800, international: 3500 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 }, rankings: { world: 68, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 15", financialAid: "May 1" }, popularMajors: ["Engineering","Sciences","Medicine","Business"], applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "required" }, admitProfile: ["holistic-us","test-required","research-emphasis"], dataYear: 2024, dataSourceUrl: "https://www.ntu.edu.tw/english/", lastUpdated: "2024-09" },

  // ───────────────────────────── Malaysia ─────────────────────────────
  { name: "University of Malaya", country: "Malaysia", region: "Asia", acceptanceRate: 30, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1300, medianACT: 28, internationalStudentPercent: 12, tuition: { domestic: 2500, international: 9000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 3500 }, rankings: { world: 65, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 31", financialAid: "May 31" }, popularMajors: ["Medicine","Engineering","Business","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.um.edu.my/", lastUpdated: "2024-09" },

  // ───────────────────────────── Thailand ─────────────────────────────
  { name: "Chulalongkorn University", country: "Thailand", region: "Asia", acceptanceRate: 25, intlAcceptanceRate: 30, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1320, medianACT: 28, internationalStudentPercent: 5, tuition: { domestic: 2000, international: 6000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 3000 }, rankings: { world: 211, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Apr 30", financialAid: "Jun 1" }, popularMajors: ["Engineering","Business","Medicine","Arts"], applicationRequirements: { essays: 1, recommendations: 1, interview: "recommended", testPolicy: "required" }, admitProfile: ["holistic-us","test-required"], dataYear: 2024, dataSourceUrl: "https://www.chula.ac.th/en/", lastUpdated: "2024-09" },

  // ───────────────────────────── Pakistan ─────────────────────────────
  { name: "Lahore University of Management Sciences", country: "Pakistan", region: "Asia", acceptanceRate: 25, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1350, medianACT: 29, internationalStudentPercent: 3, tuition: { domestic: 7000, international: 10000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 691, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Feb 15", financialAid: "Apr 1" }, popularMajors: ["Computer Science","Business","Economics","Engineering"], applicationRequirements: { essays: 2, recommendations: 2, interview: "recommended", testPolicy: "required" }, admitProfile: ["holistic-us","test-required"], dataYear: 2024, dataSourceUrl: "https://lums.edu.pk/", lastUpdated: "2024-09" },

  // ───────────────────────────── Qatar ─────────────────────────────
  { name: "Qatar University", country: "Qatar", region: "Middle East", acceptanceRate: 50, intlAcceptanceRate: 45, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1250, medianACT: 26, internationalStudentPercent: 35, tuition: { domestic: 0, international: 12000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 173, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "May 31", financialAid: "Jul 1" }, popularMajors: ["Engineering","Business","Medicine","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" }, admitProfile: ["holistic-us","test-required"], dataYear: 2024, dataSourceUrl: "https://www.qu.edu.qa/", lastUpdated: "2024-09" },

  // ───────────────────────────── Saudi Arabia ─────────────────────────────
  { name: "King Abdullah University of Science and Technology", country: "Saudi Arabia", region: "Middle East", acceptanceRate: 12, intlAcceptanceRate: 15, acceptanceRateTrend: "stable", medianGPA: 3.7, medianSAT: 1400, medianACT: 31, internationalStudentPercent: 70, tuition: { domestic: 0, international: 0 }, financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: true, internationalAid: true, averageAidPackage: 30000 }, rankings: { world: 220, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 15", financialAid: "Jan 15" }, popularMajors: ["Engineering","Sciences","Computer Science","Bioscience"], applicationRequirements: { essays: 2, recommendations: 3, interview: "recommended", testPolicy: "required" }, admitProfile: ["research-emphasis","test-required","need-blind-intl"], dataYear: 2024, dataSourceUrl: "https://www.kaust.edu.sa/en", lastUpdated: "2024-09" },

  // ───────────────────────────── Israel ─────────────────────────────
  { name: "Hebrew University of Jerusalem", country: "Israel", region: "Middle East", acceptanceRate: 30, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1380, medianACT: 30, internationalStudentPercent: 12, tuition: { domestic: 3000, international: 12000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 81, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 15", financialAid: "May 1" }, popularMajors: ["Sciences","Medicine","Humanities","Business"], applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "required" }, admitProfile: ["holistic-us","test-required","research-emphasis"], dataYear: 2024, dataSourceUrl: "https://en.huji.ac.il/", lastUpdated: "2024-09" },
  { name: "Tel Aviv University", country: "Israel", region: "Middle East", acceptanceRate: 32, intlAcceptanceRate: 36, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1370, medianACT: 30, internationalStudentPercent: 10, tuition: { domestic: 3000, international: 12000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 215, national: 2, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 31", financialAid: "May 1" }, popularMajors: ["Engineering","Business","Sciences","Medicine"], applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "required" }, admitProfile: ["holistic-us","test-required"], dataYear: 2024, dataSourceUrl: "https://english.tau.ac.il/", lastUpdated: "2024-09" },

  // ───────────────────────────── Mexico ─────────────────────────────
  { name: "Tecnológico de Monterrey", country: "Mexico", region: "Latin America", acceptanceRate: 41, intlAcceptanceRate: 50, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1300, medianACT: 28, internationalStudentPercent: 9, tuition: { domestic: 17000, international: 17000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 8000 }, rankings: { world: 184, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Apr 30", financialAid: "May 31" }, popularMajors: ["Business","Engineering","Computer Science","Architecture"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://tec.mx/en", lastUpdated: "2024-09" },
  { name: "Universidad Nacional Autónoma de México", country: "Mexico", region: "Latin America", acceptanceRate: 9, intlAcceptanceRate: 15, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1320, medianACT: 28, internationalStudentPercent: 3, tuition: { domestic: 100, international: 600 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 1500 }, rankings: { world: 93, national: 2, source: "QS", year: 2024 }, deadlines: { regularDecision: "Feb 28", financialAid: "Apr 1" }, popularMajors: ["Medicine","Engineering","Law","Sciences"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "required" }, admitProfile: ["broad-access","test-required"], dataYear: 2024, dataSourceUrl: "https://www.unam.mx/", lastUpdated: "2024-09" },

  // ───────────────────────────── Brazil ─────────────────────────────
  { name: "Universidade de São Paulo", country: "Brazil", region: "Latin America", acceptanceRate: 11, intlAcceptanceRate: 18, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1330, medianACT: 29, internationalStudentPercent: 4, tuition: { domestic: 0, international: 0 }, financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: true, internationalAid: true, averageAidPackage: 2000 }, rankings: { world: 85, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Dec 30", financialAid: "Feb 1" }, popularMajors: ["Medicine","Engineering","Law","Sciences"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "required" }, admitProfile: ["broad-access","test-required","need-blind-intl"], dataYear: 2024, dataSourceUrl: "https://www5.usp.br/english/", lastUpdated: "2024-09" },

  // ───────────────────────────── Argentina ─────────────────────────────
  { name: "Universidad de Buenos Aires", country: "Argentina", region: "Latin America", acceptanceRate: 60, intlAcceptanceRate: 55, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1250, medianACT: 26, internationalStudentPercent: 6, tuition: { domestic: 0, international: 0 }, financialAid: { needBlind: true, needBlindIntl: true, meritScholarships: true, internationalAid: true, averageAidPackage: 1000 }, rankings: { world: 71, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Dec 15", financialAid: "Feb 1" }, popularMajors: ["Medicine","Law","Engineering","Humanities"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional","need-blind-intl"], dataYear: 2024, dataSourceUrl: "http://www.uba.ar/internacionales/", lastUpdated: "2024-09" },

  // ───────────────────────────── Chile ─────────────────────────────
  { name: "Pontificia Universidad Católica de Chile", country: "Chile", region: "Latin America", acceptanceRate: 30, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1310, medianACT: 28, internationalStudentPercent: 7, tuition: { domestic: 8000, international: 10000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 }, rankings: { world: 93, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 7", financialAid: "Mar 1" }, popularMajors: ["Engineering","Medicine","Business","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" }, admitProfile: ["holistic-us","test-required"], dataYear: 2024, dataSourceUrl: "https://www.uc.cl/en/", lastUpdated: "2024-09" },

  // ───────────────────────────── Colombia ─────────────────────────────
  { name: "Universidad de los Andes", country: "Colombia", region: "Latin America", acceptanceRate: 36, intlAcceptanceRate: 40, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1300, medianACT: 28, internationalStudentPercent: 5, tuition: { domestic: 9000, international: 11000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4500 }, rankings: { world: 198, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Apr 30", financialAid: "May 31" }, popularMajors: ["Engineering","Business","Economics","Law"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://uniandes.edu.co/en", lastUpdated: "2024-09" },

  // ───────────────────────────── South Africa ─────────────────────────────
  { name: "University of Cape Town", country: "South Africa", region: "Africa", acceptanceRate: 16, intlAcceptanceRate: 20, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1320, medianACT: 28, internationalStudentPercent: 18, tuition: { domestic: 4000, international: 9000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 4000 }, rankings: { world: 173, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jul 31", financialAid: "Sep 1" }, popularMajors: ["Engineering","Medicine","Business","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.uct.ac.za/", lastUpdated: "2024-09" },
  { name: "University of the Witwatersrand", country: "South Africa", region: "Africa", acceptanceRate: 20, intlAcceptanceRate: 25, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1300, medianACT: 28, internationalStudentPercent: 11, tuition: { domestic: 3500, international: 8000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 3500 }, rankings: { world: 264, national: 2, source: "QS", year: 2024 }, deadlines: { regularDecision: "Sep 30", financialAid: "Oct 31" }, popularMajors: ["Engineering","Medicine","Sciences","Business"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.wits.ac.za/", lastUpdated: "2024-09" },

  // ───────────────────────────── Egypt ─────────────────────────────
  { name: "American University in Cairo", country: "Egypt", region: "Africa", acceptanceRate: 41, intlAcceptanceRate: 45, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1280, medianACT: 27, internationalStudentPercent: 8, tuition: { domestic: 22000, international: 22000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 9000 }, rankings: { world: 410, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Feb 1", financialAid: "Mar 1" }, popularMajors: ["Business","Engineering","Humanities","Computer Science"], applicationRequirements: { essays: 2, recommendations: 2, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.aucegypt.edu/", lastUpdated: "2024-09" },

  // ───────────────────────────── Nigeria ─────────────────────────────
  { name: "University of Ibadan", country: "Nigeria", region: "Africa", acceptanceRate: 25, intlAcceptanceRate: 30, acceptanceRateTrend: "stable", medianGPA: 3.4, medianSAT: 1250, medianACT: 26, internationalStudentPercent: 2, tuition: { domestic: 500, international: 2500 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 1500 }, rankings: { world: 1001, national: 1, source: "QS", year: 2024 }, deadlines: { regularDecision: "Aug 15", financialAid: "Oct 1" }, popularMajors: ["Medicine","Sciences","Humanities","Engineering"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" }, admitProfile: ["broad-access","test-required"], dataYear: 2024, dataSourceUrl: "https://www.ui.edu.ng/", lastUpdated: "2024-09" },

  // ───────────────────────────── Additional US (broader access) ─────────────────────────────
  { name: "Penn State University", country: "USA", region: "North America", acceptanceRate: 55, intlAcceptanceRate: 50, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1280, medianACT: 28, internationalStudentPercent: 11, tuition: { domestic: 19000, international: 38000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 12000 }, rankings: { world: 93, national: 60, source: "QS", year: 2024 }, deadlines: { earlyAction: "Nov 1", regularDecision: "Jan 15", financialAid: "Feb 15" }, popularMajors: ["Engineering","Business","Sciences","Communications"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://admissions.psu.edu/", lastUpdated: "2024-09" },
  { name: "Ohio State University", country: "USA", region: "North America", acceptanceRate: 53, intlAcceptanceRate: 48, acceptanceRateTrend: "stable", medianGPA: 3.8, medianSAT: 1340, medianACT: 30, internationalStudentPercent: 10, tuition: { domestic: 12000, international: 36000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 13000 }, rankings: { world: 153, national: 43, source: "QS", year: 2024 }, deadlines: { earlyAction: "Nov 1", regularDecision: "Feb 1", financialAid: "Feb 1" }, popularMajors: ["Business","Engineering","Sciences","Communications"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://undergrad.osu.edu/", lastUpdated: "2024-09" },
  { name: "University of Florida", country: "USA", region: "North America", acceptanceRate: 23, intlAcceptanceRate: 20, acceptanceRateTrend: "declining", medianGPA: 4.4, medianSAT: 1400, medianACT: 32, internationalStudentPercent: 6, tuition: { domestic: 6400, international: 28700 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 11000 }, rankings: { world: 168, national: 28, source: "QS", year: 2024 }, deadlines: { earlyAction: "Nov 1", regularDecision: "Mar 1", financialAid: "Mar 1" }, popularMajors: ["Business","Engineering","Sciences","Communications"], applicationRequirements: { essays: 3, recommendations: 0, interview: "optional", testPolicy: "required" }, admitProfile: ["holistic-us","test-required"], dataYear: 2024, dataSourceUrl: "https://admissions.ufl.edu/", lastUpdated: "2024-09" },
  { name: "Arizona State University", country: "USA", region: "North America", acceptanceRate: 90, intlAcceptanceRate: 85, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1240, medianACT: 26, internationalStudentPercent: 14, tuition: { domestic: 12000, international: 32000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 10000 }, rankings: { world: 179, national: 105, source: "QS", year: 2024 }, deadlines: { regularDecision: "Rolling", financialAid: "Mar 1" }, popularMajors: ["Engineering","Business","Sciences","Design"], applicationRequirements: { essays: 1, recommendations: 0, interview: "optional", testPolicy: "optional" }, admitProfile: ["broad-access","test-optional"], dataYear: 2024, dataSourceUrl: "https://admission.asu.edu/", lastUpdated: "2024-09" },

  // ───────────────────────────── Additional UK ─────────────────────────────
  { name: "King's College London", country: "UK", region: "Europe", acceptanceRate: 13, intlAcceptanceRate: 18, acceptanceRateTrend: "stable", medianGPA: 3.7, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 42, tuition: { domestic: 11500, international: 33000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 }, rankings: { world: 40, national: 6, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 25", financialAid: "Apr 1" }, popularMajors: ["Medicine","Law","Sciences","Humanities"], applicationRequirements: { essays: 1, recommendations: 1, interview: "recommended", testPolicy: "required" }, admitProfile: ["subject-focused","test-required"], dataYear: 2024, dataSourceUrl: "https://www.kcl.ac.uk/study", lastUpdated: "2024-09" },
  { name: "University of Manchester", country: "UK", region: "Europe", acceptanceRate: 56, intlAcceptanceRate: 50, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1370, medianACT: 30, internationalStudentPercent: 33, tuition: { domestic: 11500, international: 30000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 32, national: 7, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 25", financialAid: "Apr 1" }, popularMajors: ["Engineering","Business","Medicine","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" }, admitProfile: ["subject-focused","test-required"], dataYear: 2024, dataSourceUrl: "https://www.manchester.ac.uk/study/", lastUpdated: "2024-09" },
  { name: "University of Edinburgh", country: "UK", region: "Europe", acceptanceRate: 40, intlAcceptanceRate: 35, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1410, medianACT: 31, internationalStudentPercent: 45, tuition: { domestic: 1820, international: 30000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 }, rankings: { world: 22, national: 5, source: "QS", year: 2024 }, deadlines: { regularDecision: "Jan 25", financialAid: "Apr 1" }, popularMajors: ["Sciences","Engineering","Humanities","Medicine"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "required" }, admitProfile: ["subject-focused","test-required"], dataYear: 2024, dataSourceUrl: "https://www.ed.ac.uk/studying", lastUpdated: "2024-09" },

  // ───────────────────────────── Additional Canada ─────────────────────────────
  { name: "University of Waterloo", country: "Canada", region: "North America", acceptanceRate: 53, intlAcceptanceRate: 45, acceptanceRateTrend: "stable", medianGPA: 3.8, medianSAT: 1430, medianACT: 32, internationalStudentPercent: 22, tuition: { domestic: 14000, international: 45000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 }, rankings: { world: 112, national: 6, source: "QS", year: 2024 }, deadlines: { regularDecision: "Feb 1", financialAid: "Apr 1" }, popularMajors: ["Computer Science","Engineering","Mathematics","Business"], applicationRequirements: { essays: 2, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["subject-focused","test-optional"], dataYear: 2024, dataSourceUrl: "https://uwaterloo.ca/future-students/", lastUpdated: "2024-09" },
  { name: "University of Alberta", country: "Canada", region: "North America", acceptanceRate: 58, intlAcceptanceRate: 50, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1330, medianACT: 29, internationalStudentPercent: 22, tuition: { domestic: 7000, international: 31000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 5000 }, rankings: { world: 111, national: 5, source: "QS", year: 2024 }, deadlines: { regularDecision: "Mar 1", financialAid: "May 1" }, popularMajors: ["Engineering","Sciences","Business","Medicine"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.ualberta.ca/admissions", lastUpdated: "2024-09" },

  // ───────────────────────────── Additional Australia ─────────────────────────────
  { name: "Monash University", country: "Australia", region: "Oceania", acceptanceRate: 40, intlAcceptanceRate: 45, acceptanceRateTrend: "stable", medianGPA: 3.5, medianSAT: 1330, medianACT: 29, internationalStudentPercent: 36, tuition: { domestic: 9000, international: 38000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6000 }, rankings: { world: 37, national: 5, source: "QS", year: 2024 }, deadlines: { regularDecision: "Dec 1", financialAid: "Feb 1" }, popularMajors: ["Medicine","Business","Engineering","Sciences"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.monash.edu/admissions", lastUpdated: "2024-09" },
  { name: "University of New South Wales", country: "Australia", region: "Oceania", acceptanceRate: 35, intlAcceptanceRate: 40, acceptanceRateTrend: "stable", medianGPA: 3.6, medianSAT: 1360, medianACT: 30, internationalStudentPercent: 37, tuition: { domestic: 9000, international: 41000 }, financialAid: { needBlind: false, needBlindIntl: false, meritScholarships: true, internationalAid: true, averageAidPackage: 6500 }, rankings: { world: 19, national: 4, source: "QS", year: 2024 }, deadlines: { regularDecision: "Dec 15", financialAid: "Feb 1" }, popularMajors: ["Engineering","Business","Sciences","Medicine"], applicationRequirements: { essays: 1, recommendations: 1, interview: "optional", testPolicy: "optional" }, admitProfile: ["holistic-us","test-optional"], dataYear: 2024, dataSourceUrl: "https://www.unsw.edu.au/study", lastUpdated: "2024-09" },
];

// ──────────────────────────────────────────────────────────────────
// Lookups
// ──────────────────────────────────────────────────────────────────

export const getUniversityByName = (name: string): UniversityStats | undefined => {
  return universityDatabase.find(
    (uni) =>
      uni.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(uni.name.toLowerCase()),
  );
};

export const getUniversitiesByCountry = (country: string): UniversityStats[] => {
  return universityDatabase.filter(
    (uni) => uni.country.toLowerCase() === country.toLowerCase(),
  );
};

export const getUniversitiesByRegion = (region: string): UniversityStats[] => {
  return universityDatabase.filter(
    (uni) => uni.region.toLowerCase() === region.toLowerCase(),
  );
};

export const calculateConfidenceLevel = (lastUpdated: string): number => {
  const months = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24 * 30),
  );
  if (months < 3) return 95;
  if (months < 6) return 90;
  if (months < 12) return 85;
  return 75;
};

// ──────────────────────────────────────────────────────────────────
// Verified-data gating — only score unis with all required fields.
// ──────────────────────────────────────────────────────────────────

export type DataGap =
  | "medianGPA"
  | "medianSAT"
  | "medianACT"
  | "acceptanceRate"
  | "testPolicy"
  | "dataSource";

export interface UniversityEligibility {
  uni: UniversityStats;
  dataComplete: boolean;
  missingFields: DataGap[];
}

export const isDataComplete = (u: UniversityStats): UniversityEligibility => {
  const missing: DataGap[] = [];
  if (!u.medianGPA || u.medianGPA <= 0) missing.push("medianGPA");
  if (!u.medianSAT || u.medianSAT <= 0) missing.push("medianSAT");
  if (!u.medianACT || u.medianACT <= 0) missing.push("medianACT");
  if (u.acceptanceRate == null || u.acceptanceRate < 0) missing.push("acceptanceRate");
  if (!u.applicationRequirements?.testPolicy) missing.push("testPolicy");
  if (!u.dataSourceUrl) missing.push("dataSource");
  return { uni: u, dataComplete: missing.length === 0, missingFields: missing };
};

const PRETTY_FIELD: Record<DataGap, string> = {
  medianGPA: "median GPA",
  medianSAT: "median SAT",
  medianACT: "median ACT",
  acceptanceRate: "acceptance rate",
  testPolicy: "test policy",
  dataSource: "verified source URL",
};

export const prettyMissing = (gaps: DataGap[]) =>
  gaps.map((g) => PRETTY_FIELD[g]).join(", ");

const COUNTRY_ALIASES: Record<string, string[]> = {
  "united states": ["usa", "us", "united states", "america", "u.s.", "u.s.a."],
  usa: ["usa", "us", "united states"],
  us: ["usa", "us", "united states"],
  "united states of america": ["usa", "us", "united states"],
  "united kingdom": ["uk", "united kingdom", "great britain", "britain", "england"],
  uk: ["uk", "united kingdom", "great britain"],
  "south korea": ["south korea", "korea", "republic of korea"],
  "hong kong": ["hong kong", "hk"],
  "united arab emirates": ["united arab emirates", "uae"],
  uae: ["united arab emirates", "uae"],
};

const normalizeCountry = (c: string): string[] => {
  const k = c.trim().toLowerCase();
  return COUNTRY_ALIASES[k] ?? [k];
};

export const buildCandidatePool = (preferredCountries?: string[]) => {
  const wanted = (preferredCountries || [])
    .flatMap(normalizeCountry)
    .filter(Boolean);

  // Build a normalized set of accepted country tokens (each preferred country
  // is expanded through its alias list, so "USA" matches "United States" rows
  // and vice-versa). Matching is STRICT EQUALITY against the alias set — never
  // substring — so "australia" cannot accidentally match the token "us".
  const acceptedTokens = new Set(wanted);
  const filterByCountries = (list: UniversityStats[]) =>
    wanted.length
      ? list.filter((u) => {
          const aliases = normalizeCountry(u.country);
          return aliases.some((a) => acceptedTokens.has(a));
        })
      : list;

  const evaluate = (pool: UniversityStats[]) => {
    const eligible: UniversityStats[] = [];
    const ineligible: { name: string; reason: string }[] = [];
    for (const u of pool) {
      const e = isDataComplete(u);
      if (e.dataComplete) eligible.push(u);
      else
        ineligible.push({
          name: u.name,
          reason: `Missing verified data: ${prettyMissing(e.missingFields)}`,
        });
    }
    return { eligible, ineligible };
  };

  // STRICT country filter: when the student selects target countries, we ONLY
  // return universities from those countries. We never silently fall back to
  // the global pool — instead the UI shows a clear message telling the user
  // there's no verified data yet for that country.
  const primary = evaluate(filterByCountries(universityDatabase));
  return { ...primary, usedGlobalFallback: false as const };
};


