// Curated Ivy admit profiles (anonymized, real-style activity inventories).
export interface IvyActivity {
  category: string;
  grades: string;
  timing: string;
  hours: string;
  role: string;
  org: string;
  description: string;
}

export interface IvyProfile {
  id: string;
  school: string;
  major: string;
  archetype: string;
  summary: string;
  activities: IvyActivity[];
  awards: string[];
  whyAccepted: string[];
}

export const IVY_PROFILES: IvyProfile[] = [
  {
    id: "harvard-medhumanitarian",
    school: "Harvard",
    major: "Human Developmental & Regenerative Biology",
    archetype: "Medical Humanitarian + Public Voice",
    summary:
      "International applicant from South Asia. Combined medical research with cultural-arts leadership and large-scale community organizing. The narrative thread: medicine as empathy.",
    activities: [
      { category: "Research", grades: "12", timing: "School, Break", hours: "15 hr/wk · 8 wk/yr", role: "Research Intern", org: "University Hospital", description: "Studied cardiovascular disease in women and inequalities within the healthcare system; wrote an op-ed on it. Assisted on research projects." },
      { category: "Environmental", grades: "12", timing: "School, Break", hours: "6 hr/wk · 16 wk/yr", role: "Chief Organiser & Founder", org: "Green Marathon Initiative", description: "With government & NGOs organized a 2,000+ person marathon, raising funds and spreading awareness to combat pollution; planted thousands of trees." },
      { category: "Internship", grades: "11", timing: "Break", hours: "20 hr/wk · 4 wk/yr", role: "Intern", org: "Hospital Psychiatry Dept.", description: "Shadowed a psychiatrist; learned the importance of patient privacy and viewing cases through a lens of empathy and respect." },
      { category: "Student Government", grades: "11, 12", timing: "School", hours: "4 hr/wk · 32 wk/yr", role: "President of Social Work Society", org: "School", description: "Coordinated with NGOs to facilitate social work opportunities for students; interviewed on national & global TV stations." },
      { category: "Community Service", grades: "11", timing: "Break", hours: "15 hr/wk · 3 wk/yr", role: "UNICEF Mission:Typhoid Intern", org: "UNICEF", description: "Helped organize the distribution of typhoid shots; spread vaccination awareness to underserved communities." },
      { category: "Social Justice", grades: "9, 10, 11", timing: "Break", hours: "30 hr/wk · 6 wk/yr", role: "Summer Director", org: "Local School / Institute", description: "Gave seminars on hygiene, gender equality, & puberty. Hosted dance, choir, sports, & art workshops. Organized donations." },
      { category: "Cultural", grades: "11, 12", timing: "School, Break", hours: "4 hr/wk · 30 wk/yr", role: "President of Dance Society", org: "School", description: "Taught dance online during COVID. Choreographed traditional wedding dances. Led workshops in rural areas." },
      { category: "Athletics: Varsity", grades: "9–12", timing: "School", hours: "5 hr/wk · 20 wk/yr", role: "Captain, Volleyball", org: "School", description: "Competed nationally; raised morale and increased female athletic participation." },
      { category: "Work (Paid)", grades: "9–12", timing: "Year-round", hours: "3 hr/wk · 40 wk/yr", role: "Founder", org: "Independent dog grooming business", description: "Built and ran a small grooming business. Arranged play dates and care schedules." },
    ],
    awards: ["Highest Funds Raised — Youth Board Member", "National TV Feature on Social Work", "Government-approved Marathon Lead", "Published Op-Ed on Health Inequity"],
    whyAccepted: [
      "Coherent narrative: every activity ties back to empathy + medicine + public voice.",
      "Geographic + first-hand impact: real organizations, real beneficiaries, named villages.",
      "Press-coverage and TV interviews as third-party validation of leadership.",
      "Athletics + paid work prevent the profile from feeling like a 'résumé pad'.",
      "Personal essay (bedwetting → empathy → medicine) earns the entire profile.",
    ],
  },
  {
    id: "stanford-cs-builder",
    school: "Stanford",
    major: "Computer Science",
    archetype: "Builder + Open Source Contributor",
    summary: "California public-school applicant. Self-taught, ships projects publicly, sustained CS competition track from grade 9.",
    activities: [
      { category: "STEM/Coding", grades: "9–12", timing: "Year-round", hours: "12 hr/wk · 50 wk/yr", role: "Open Source Maintainer", org: "Personal GitHub (3.4k stars)", description: "Built and maintains a developer-tool used by 8k weekly active devs. Merged 200+ community PRs." },
      { category: "Research", grades: "11, 12", timing: "Summer", hours: "40 hr/wk · 8 wk/yr", role: "ML Research Intern", org: "Local university lab", description: "Co-authored workshop paper on efficient on-device transformers." },
      { category: "Competition", grades: "10–12", timing: "Year", hours: "6 hr/wk · 30 wk/yr", role: "USACO Platinum Competitor", org: "USACO", description: "Reached Platinum Division. Coached 12 underclassmen to Gold." },
      { category: "Leadership", grades: "11, 12", timing: "School", hours: "3 hr/wk · 30 wk/yr", role: "Founder & President", org: "School AI Club", description: "Founded, grew to 60 members. Organized 2 hackathons (200+ participants)." },
      { category: "Community Service", grades: "10–12", timing: "Year", hours: "2 hr/wk · 30 wk/yr", role: "Free CS Tutor", org: "Title-I middle schools", description: "Designed a 12-week intro-to-Python curriculum, taught 80+ students." },
      { category: "Work (Paid)", grades: "11, 12", timing: "Summer", hours: "30 hr/wk · 10 wk/yr", role: "Software Engineering Intern", org: "Series-A startup", description: "Shipped billing system used in production by 1k customers." },
      { category: "Arts", grades: "9–12", timing: "School", hours: "3 hr/wk · 30 wk/yr", role: "Jazz Pianist", org: "School Combo", description: "Counterpoint to a CS-heavy profile — played at 3 city jazz festivals." },
    ],
    awards: ["USACO Platinum", "Regeneron STS Top 300", "Hackathon — Best AI Project (twice)", "Workshop Co-Authorship"],
    whyAccepted: [
      "Extreme depth in one craft (CS) + measurable public impact (8k DAU, 3.4k stars).",
      "Teaching dimension: doesn't just compete — coaches and tutors.",
      "One non-technical love (jazz) signals a whole person, not a robot.",
      "Internship work shows ability to ship production code, not just side projects.",
    ],
  },
  {
    id: "yale-humanities-writer",
    school: "Yale",
    major: "English & Comparative Literature",
    archetype: "Writer + Editor + Cultural Critic",
    summary: "First-gen applicant. Built a national-level publishing résumé through editorial work and original criticism.",
    activities: [
      { category: "Writing", grades: "10–12", timing: "Year", hours: "8 hr/wk · 40 wk/yr", role: "Editor-in-Chief", org: "School literary magazine (national award)", description: "Tripled submissions, redesigned the print + web edition, won CSPA Gold Crown." },
      { category: "Writing/Publishing", grades: "11, 12", timing: "Year", hours: "5 hr/wk · 30 wk/yr", role: "Contributing Critic", org: "Regional teen-lit review (paid)", description: "Published 22 book reviews; one syndicated to a national outlet." },
      { category: "Research", grades: "12", timing: "Summer", hours: "30 hr/wk · 6 wk/yr", role: "Telluride Association Summer Program", org: "TASP", description: "Six-week humanities seminar; produced a 25-page paper on translation theory." },
      { category: "Leadership", grades: "11, 12", timing: "School", hours: "3 hr/wk · 30 wk/yr", role: "Co-President of Debate", org: "School", description: "Coached novices; team won state for the first time in school history." },
      { category: "Community Service", grades: "9–12", timing: "Year", hours: "4 hr/wk · 32 wk/yr", role: "ESL Reading Tutor", org: "Public library", description: "Sustained 4 years; tutored 14 adult learners." },
      { category: "Work", grades: "10–12", timing: "Year", hours: "12 hr/wk · 45 wk/yr", role: "Bookstore Clerk", org: "Independent bookstore", description: "Helped support family. Curated the staff-pick shelf for 18 months." },
    ],
    awards: ["YoungArts Finalist (Writing)", "Scholastic Gold Medal — Critical Essay", "CSPA Gold Crown (Editor)", "TASP Scholar"],
    whyAccepted: [
      "Public, external validation of writing (YoungArts, Scholastic) — not just self-claimed talent.",
      "Editorial leadership: shaping others' work is rarer than producing your own.",
      "Sustained service (4 years tutoring) signals depth over flash.",
      "Paid work supporting family adds context to socioeconomic profile.",
    ],
  },
];
