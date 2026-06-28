/**
 * countryPathways.ts — per-country application context layer.
 *
 * Pure data. No predictions, no AI. Used by:
 *   - CountryPathway briefing component (above match cards)
 *   - Action Center (next-step per country)
 *
 * Sources are official government/admissions pages (linked per entry).
 */

export type Difficulty = "Moderate" | "Selective" | "Highly Selective" | "Extremely Selective";

export interface CountryPathway {
  country: string;            // canonical key matching universityData.country
  flag: string;               // emoji
  timeline: {
    season: string;           // e.g. "Aug–Jan"
    decisions: string;        // e.g. "Mar–Apr"
    enrollment: string;       // e.g. "Aug–Sep"
  };
  cost: {
    tuitionRange: string;     // USD range, intl student
    livingRange: string;      // USD/year
    totalAnnual: string;      // combined
  };
  visa: {
    type: string;             // e.g. "F-1 Student Visa"
    processingWeeks: string;  // e.g. "2–8 weeks"
    requiresInterview: boolean;
    keySteps: string[];       // ordered
    sourceUrl: string;
  };
  requiredTests: string[];    // e.g. ["TOEFL 100+ or IELTS 7.0+", "SAT or ACT"]
  difficulty: Difficulty;
  /** One concrete next action a student from anywhere can take this week. */
  firstAction: string;
}

export const COUNTRY_PATHWAYS: Record<string, CountryPathway> = {
  USA: {
    country: "USA",
    flag: "🇺🇸",
    timeline: {
      season: "Aug 1 – Jan 1",
      decisions: "Mar – Apr",
      enrollment: "Aug – Sep",
    },
    cost: {
      tuitionRange: "$55,000 – $68,000",
      livingRange: "$15,000 – $25,000",
      totalAnnual: "$70,000 – $95,000",
    },
    visa: {
      type: "F-1 Student Visa",
      processingWeeks: "2 – 8 weeks",
      requiresInterview: true,
      keySteps: [
        "Receive I-20 form from your university",
        "Pay SEVIS I-901 fee ($350)",
        "Complete DS-160 online application",
        "Schedule consular interview",
        "Attend interview with financial proof",
      ],
      sourceUrl: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    },
    requiredTests: ["TOEFL 100+ or IELTS 7.0+", "SAT or ACT (most schools)", "AP/SAT II (selective)"],
    difficulty: "Highly Selective",
    firstAction: "Open a Common App account and list 6–10 target schools by deadline tier.",
  },
  UK: {
    country: "UK",
    flag: "🇬🇧",
    timeline: {
      season: "Sep 1 – Jan 31 (UCAS)",
      decisions: "Feb – May",
      enrollment: "Sep – Oct",
    },
    cost: {
      tuitionRange: "£25,000 – £45,000",
      livingRange: "£12,000 – £18,000",
      totalAnnual: "£37,000 – £63,000",
    },
    visa: {
      type: "Student Visa (Tier 4)",
      processingWeeks: "3 weeks (standard)",
      requiresInterview: false,
      keySteps: [
        "Receive CAS (Confirmation of Acceptance for Studies)",
        "Prove financial means (28-day rule)",
        "Complete TB test (if applicable)",
        "Submit online visa application",
        "Attend biometrics appointment",
      ],
      sourceUrl: "https://www.gov.uk/student-visa",
    },
    requiredTests: ["IELTS 6.5 – 7.5", "Subject-specific tests (LNAT, BMAT, MAT, TSA at Oxbridge)"],
    difficulty: "Highly Selective",
    firstAction: "Register on UCAS and draft your single 4,000-character personal statement.",
  },
  Canada: {
    country: "Canada",
    flag: "🇨🇦",
    timeline: {
      season: "Sep 1 – Jan 15",
      decisions: "Feb – May",
      enrollment: "Sep",
    },
    cost: {
      tuitionRange: "CA$25,000 – CA$60,000",
      livingRange: "CA$12,000 – CA$18,000",
      totalAnnual: "CA$37,000 – CA$78,000",
    },
    visa: {
      type: "Study Permit",
      processingWeeks: "8 – 12 weeks",
      requiresInterview: false,
      keySteps: [
        "Receive Letter of Acceptance from a DLI",
        "Get Provincial Attestation Letter (PAL)",
        "Prove financial support (GIC + tuition)",
        "Complete biometrics",
        "Submit online study permit application",
      ],
      sourceUrl: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    },
    requiredTests: ["IELTS 6.5+ or TOEFL 90+", "SAT optional at most schools"],
    difficulty: "Selective",
    firstAction: "Apply directly through each university's portal (no central system like UCAS).",
  },
  Australia: {
    country: "Australia",
    flag: "🇦🇺",
    timeline: {
      season: "Aug – Dec (rolling)",
      decisions: "Within 4–8 weeks of applying",
      enrollment: "Feb (Sem 1) or Jul (Sem 2)",
    },
    cost: {
      tuitionRange: "AU$30,000 – AU$50,000",
      livingRange: "AU$21,000 – AU$30,000",
      totalAnnual: "AU$51,000 – AU$80,000",
    },
    visa: {
      type: "Student Visa (Subclass 500)",
      processingWeeks: "4 – 12 weeks",
      requiresInterview: false,
      keySteps: [
        "Receive Confirmation of Enrolment (CoE)",
        "Take Genuine Student (GS) requirement seriously",
        "Arrange OSHC health cover",
        "Submit online via ImmiAccount",
        "Provide financial + English proof",
      ],
      sourceUrl: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    },
    requiredTests: ["IELTS 6.5+ or TOEFL 79+", "Subject prerequisites vary by program"],
    difficulty: "Selective",
    firstAction: "Apply directly to universities; many accept rolling admissions with quick decisions.",
  },
  Singapore: {
    country: "Singapore",
    flag: "🇸🇬",
    timeline: {
      season: "Oct – Mar",
      decisions: "Apr – Jun",
      enrollment: "Aug",
    },
    cost: {
      tuitionRange: "S$30,000 – S$50,000",
      livingRange: "S$12,000 – S$18,000",
      totalAnnual: "S$42,000 – S$68,000",
    },
    visa: {
      type: "Student Pass",
      processingWeeks: "4 – 6 weeks",
      requiresInterview: false,
      keySteps: [
        "Receive offer from NUS / NTU / SMU",
        "Apply via SOLAR system within 2 weeks",
        "Complete medical examination",
        "Collect Student Pass at ICA on arrival",
      ],
      sourceUrl: "https://www.ica.gov.sg/enter-transit-depart/student-pass",
    },
    requiredTests: ["SAT 1400+ or strong A-Levels/IB", "IELTS/TOEFL waived if English-medium"],
    difficulty: "Highly Selective",
    firstAction: "Apply directly to NUS, NTU, or SMU through their international applicant portal.",
  },
  Japan: {
    country: "Japan",
    flag: "🇯🇵",
    timeline: {
      season: "Sep – Jan (English programs)",
      decisions: "Mar – May",
      enrollment: "Apr or Sep",
    },
    cost: {
      tuitionRange: "¥535,800 – ¥3,000,000",
      livingRange: "¥1,000,000 – ¥1,500,000",
      totalAnnual: "¥1,500,000 – ¥4,500,000",
    },
    visa: {
      type: "Student Visa",
      processingWeeks: "1 – 3 months",
      requiresInterview: true,
      keySteps: [
        "Receive Certificate of Eligibility (CoE) from school",
        "Submit visa application at Japanese embassy",
        "Provide financial guarantor docs",
        "Attend interview",
        "Apply for Residence Card on arrival",
      ],
      sourceUrl: "https://www.studyinjapan.go.jp/en/",
    },
    requiredTests: ["EJU (Examination for Japanese University Admission)", "JLPT N2+ or English programs (TOEFL 80+)"],
    difficulty: "Highly Selective",
    firstAction: "Identify English-medium programs (e.g., U-Tokyo PEAK) vs Japanese-medium tracks.",
  },
  "Hong Kong": {
    country: "Hong Kong",
    flag: "🇭🇰",
    timeline: {
      season: "Oct – Jan",
      decisions: "Mar – Jun",
      enrollment: "Sep",
    },
    cost: {
      tuitionRange: "HK$140,000 – HK$200,000",
      livingRange: "HK$80,000 – HK$120,000",
      totalAnnual: "HK$220,000 – HK$320,000",
    },
    visa: {
      type: "Student Visa",
      processingWeeks: "6 – 8 weeks",
      requiresInterview: false,
      keySteps: [
        "Receive offer from HKU / HKUST / CUHK",
        "Sponsor university files visa on your behalf",
        "Provide financial proof + passport",
        "Collect visa label and Student ID on arrival",
      ],
      sourceUrl: "https://www.immd.gov.hk/eng/services/visas/study.html",
    },
    requiredTests: ["IELTS 6.5+ or TOEFL 80+", "Strong A-Level / IB / SAT"],
    difficulty: "Highly Selective",
    firstAction: "Apply directly to each university; HKU and HKUST have separate portals.",
  },
  Switzerland: {
    country: "Switzerland",
    flag: "🇨🇭",
    timeline: {
      season: "Nov – Apr",
      decisions: "May – Jul",
      enrollment: "Sep",
    },
    cost: {
      tuitionRange: "CHF 1,500 – CHF 8,000",
      livingRange: "CHF 18,000 – CHF 28,000",
      totalAnnual: "CHF 19,500 – CHF 36,000",
    },
    visa: {
      type: "Type D National Visa",
      processingWeeks: "8 – 12 weeks",
      requiresInterview: true,
      keySteps: [
        "Receive admission letter from ETH/EPFL/etc.",
        "Submit visa application at Swiss embassy",
        "Prove financial means (~CHF 21,000/year)",
        "Register at local authorities within 14 days of arrival",
      ],
      sourceUrl: "https://www.sem.admin.ch/sem/en/home.html",
    },
    requiredTests: ["German/French/Italian B2 (or English for ETH/EPFL programs)", "Strong math/science background"],
    difficulty: "Highly Selective",
    firstAction: "Verify language requirements — most programs are in German, French, or Italian.",
  },
  Germany: {
    country: "Germany",
    flag: "🇩🇪",
    timeline: {
      season: "May – Jul (Winter) / Dec – Jan (Summer)",
      decisions: "Aug – Sep",
      enrollment: "Oct or Apr",
    },
    cost: {
      tuitionRange: "€0 – €3,000 (most public)",
      livingRange: "€10,000 – €14,000",
      totalAnnual: "€10,000 – €17,000",
    },
    visa: {
      type: "National Visa for Studies",
      processingWeeks: "6 – 12 weeks",
      requiresInterview: true,
      keySteps: [
        "Open blocked account (~€11,208)",
        "Apply at German embassy with admission letter",
        "Provide health insurance proof",
        "Register at local Bürgeramt on arrival",
        "Apply for residence permit",
      ],
      sourceUrl: "https://www.auswaertiges-amt.de/en/visa-service/-/231148",
    },
    requiredTests: ["TestDaF/DSH (German programs) or IELTS 6.5+ (English)", "APS certificate for some countries"],
    difficulty: "Selective",
    firstAction: "Apply via uni-assist.de for most public universities.",
  },
};

/** Get pathway by country (case + variant tolerant). */
export const getCountryPathway = (country: string): CountryPathway | null => {
  if (!country) return null;
  const key = country.trim();
  if (COUNTRY_PATHWAYS[key]) return COUNTRY_PATHWAYS[key];
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(COUNTRY_PATHWAYS)) {
    if (k.toLowerCase() === lower) return v;
    if (k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())) return v;
  }
  return null;
};

export const SUPPORTED_PATHWAY_COUNTRIES = Object.keys(COUNTRY_PATHWAYS);
