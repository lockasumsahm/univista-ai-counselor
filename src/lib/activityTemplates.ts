// ============================================================================
// UniVista — Activity Template Library
// Drives the chip-based ActivityBuilder. Students mostly SELECT, not WRITE.
// ============================================================================

export type ActivityCategoryKey =
  | "Leadership"
  | "Research"
  | "Sports"
  | "NGO"
  | "Creative"
  | "Work"
  | "Other";

export interface ActivityTemplate {
  subtype: string;
  emoji: string;
  roles: string[];
  achievements: string[];
}

export interface ActivityCategoryDef {
  key: ActivityCategoryKey;
  label: string;
  emoji: string;
  templates: ActivityTemplate[];
}

export const ACTIVITY_CATEGORIES: ActivityCategoryDef[] = [
  {
    key: "Sports",
    label: "Sports & Athletics",
    emoji: "🏅",
    templates: [
      { subtype: "Football", emoji: "⚽", roles: ["Goalkeeper", "Striker", "Midfielder", "Defender", "Captain", "Vice-Captain", "Team Manager"], achievements: ["Varsity Player", "Tournament Winner", "National Player", "Club Player", "League MVP", "Top Scorer", "All-Star Selection"] },
      { subtype: "Basketball", emoji: "🏀", roles: ["Point Guard", "Shooting Guard", "Forward", "Center", "Captain", "Bench Coach"], achievements: ["Varsity", "State Champion", "MVP", "All-League", "Tournament Winner"] },
      { subtype: "Cricket", emoji: "🏏", roles: ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper", "Captain"], achievements: ["State Player", "National Squad", "Man of the Match", "League Champion"] },
      { subtype: "Tennis", emoji: "🎾", roles: ["Singles Player", "Doubles Player", "Team Captain"], achievements: ["State Ranking", "National Ranking", "ITF Junior", "School Champion"] },
      { subtype: "Swimming", emoji: "🏊", roles: ["Sprinter", "Distance", "Relay Team", "Captain"], achievements: ["State Qualifier", "National Qualifier", "School Record", "Junior Olympics"] },
      { subtype: "Track & Field", emoji: "🏃", roles: ["Sprinter", "Distance Runner", "Jumper", "Thrower", "Captain"], achievements: ["State Qualifier", "National Meet", "School Record", "Cross-Country Captain"] },
      { subtype: "Volleyball", emoji: "🏐", roles: ["Setter", "Spiker", "Libero", "Captain"], achievements: ["Varsity", "National Tournament", "MVP"] },
      { subtype: "Martial Arts", emoji: "🥋", roles: ["Practitioner", "Black Belt", "Instructor"], achievements: ["National Medal", "International Medal", "Black Belt", "Tournament Winner"] },
      { subtype: "Other Sport", emoji: "🏆", roles: ["Player", "Captain", "Coach"], achievements: ["State Level", "National Level", "International Level"] },
    ],
  },
  {
    key: "Research",
    label: "STEM & Research",
    emoji: "🔬",
    templates: [
      { subtype: "Lab Research", emoji: "🧪", roles: ["Research Assistant", "Lead Researcher", "Co-Author", "Lab Intern"], achievements: ["Published Paper", "Conference Presentation", "Co-Authorship", "Independent Study", "University Internship"] },
      { subtype: "Independent Project", emoji: "💡", roles: ["Founder", "Lead Investigator", "Engineer"], achievements: ["AI Project Built", "Open Source Released", "Patent Filed", "Competition Finalist"] },
      { subtype: "Robotics", emoji: "🤖", roles: ["Programmer", "Builder", "Captain", "Strategist"], achievements: ["FRC Regional Winner", "FTC Finalist", "VEX Champion", "Innovation Award"] },
      { subtype: "Olympiad", emoji: "🥇", roles: ["Competitor", "Team Captain"], achievements: ["IMO/IPhO/IChO Medalist", "National Olympiad Top 10", "USAMO/USAPhO", "Regional Winner"] },
      { subtype: "Coding / CS", emoji: "💻", roles: ["Developer", "Open Source Contributor", "Hackathon Lead"], achievements: ["Hackathon Winner", "App Published", "GitHub 100+ Stars", "USACO Platinum"] },
      { subtype: "Math / Stats", emoji: "📐", roles: ["Competitor", "Tutor"], achievements: ["AMC Distinction", "AIME Qualifier", "Math Circle Lead"] },
      { subtype: "Science Fair", emoji: "🔭", roles: ["Project Lead", "Co-Researcher"], achievements: ["ISEF Finalist", "Regional Winner", "State Fair Top 3"] },
    ],
  },
  {
    key: "Leadership",
    label: "Leadership & Student Gov",
    emoji: "👥",
    templates: [
      { subtype: "Student Government", emoji: "🏛️", roles: ["President", "Vice President", "Secretary", "Treasurer", "Class Rep"], achievements: ["Elected Office", "Policy Passed", "Event Organized", "Multi-year Service"] },
      { subtype: "Club President", emoji: "👑", roles: ["Founder", "President", "VP", "Officer"], achievements: ["Founded Club", "Grew Membership 2x+", "Led Major Event", "Sustained 2+ Years"] },
      { subtype: "MUN / Debate", emoji: "🎤", roles: ["Delegate", "Chair", "Secretary-General", "Captain"], achievements: ["Best Delegate", "Outstanding Delegate", "Tournament Winner", "Hosted Conference"] },
      { subtype: "Founder / Entrepreneur", emoji: "🚀", roles: ["Founder", "Co-Founder", "CEO"], achievements: ["Incorporated Business", "Revenue Generated", "Pitch Competition Winner", "Featured in Press"] },
      { subtype: "Honor Society", emoji: "🎖️", roles: ["President", "Officer", "Member"], achievements: ["NHS Officer", "Cum Laude", "Service Hours Lead"] },
    ],
  },
  {
    key: "NGO",
    label: "Volunteer & Service",
    emoji: "❤️",
    templates: [
      { subtype: "Community Volunteering", emoji: "🤝", roles: ["Volunteer", "Coordinator", "Team Lead"], achievements: ["100+ Hours", "500+ Hours", "Award Recipient", "Sustained 2+ Years"] },
      { subtype: "NGO Internship", emoji: "🌍", roles: ["Intern", "Program Assistant", "Field Officer"], achievements: ["UNICEF Intern", "Red Cross Intern", "Direct Beneficiary Impact"] },
      { subtype: "Fundraising", emoji: "💰", roles: ["Organizer", "Lead Fundraiser", "Campaign Manager"], achievements: ["Raised $1k+", "Raised $10k+", "Raised $100k+", "Gala Organized"] },
      { subtype: "Tutoring / Mentoring", emoji: "📚", roles: ["Tutor", "Mentor", "Program Lead"], achievements: ["100+ Hours Tutored", "Founded Program", "Underserved Community"] },
      { subtype: "Environmental", emoji: "🌱", roles: ["Organizer", "Activist", "Founder"], achievements: ["Planted 1000+ Trees", "Climate March Lead", "Policy Advocacy", "Tree Planting Drive"] },
      { subtype: "Health / Medical", emoji: "🏥", roles: ["Volunteer", "Hospital Intern", "Awareness Lead"], achievements: ["Hospital 100+ Hours", "Vaccination Drive", "Awareness Campaign"] },
    ],
  },
  {
    key: "Creative",
    label: "Arts & Creative",
    emoji: "🎨",
    templates: [
      { subtype: "Music", emoji: "🎵", roles: ["Performer", "Composer", "Section Leader", "Soloist"], achievements: ["State Honor Band", "All-State", "Carnegie Hall", "Album Released", "Competition Winner"] },
      { subtype: "Dance", emoji: "💃", roles: ["Dancer", "Choreographer", "Captain", "Instructor"], achievements: ["Lead Choreographer", "Festival Performance", "Competition Winner", "Studio Founder"] },
      { subtype: "Theatre / Drama", emoji: "🎭", roles: ["Lead Actor", "Director", "Writer", "Producer"], achievements: ["Lead Role", "Original Play Staged", "Festival Selection", "Best Actor"] },
      { subtype: "Visual Arts", emoji: "🖼️", roles: ["Artist", "Studio Founder", "Curator"], achievements: ["Scholastic Gold Key", "Gallery Show", "Portfolio Published", "Commission Sold"] },
      { subtype: "Writing / Journalism", emoji: "✍️", roles: ["Writer", "Editor", "Editor-in-Chief", "Columnist"], achievements: ["Editor-in-Chief", "Published Article", "National Award", "Book Published"] },
      { subtype: "Film / Photography", emoji: "🎬", roles: ["Director", "Photographer", "Editor"], achievements: ["Festival Selection", "Published Photo", "Documentary Released", "Brand Commission"] },
    ],
  },
  {
    key: "Work",
    label: "Work & Internships",
    emoji: "💼",
    templates: [
      { subtype: "Internship", emoji: "🏢", roles: ["Intern", "Research Intern", "Engineering Intern", "Business Intern"], achievements: ["Top-Tier Firm", "Conversion Offer", "Project Shipped", "Recommendation Letter"] },
      { subtype: "Paid Job", emoji: "💵", roles: ["Cashier", "Server", "Tutor", "Assistant", "Specialist"], achievements: ["1+ Year Tenure", "Promoted", "Employee of Month", "Family Support"] },
      { subtype: "Own Business", emoji: "📈", roles: ["Founder", "Owner", "Operator"], achievements: ["Profitable", "$1k+ Revenue", "$10k+ Revenue", "Hired Employees"] },
      { subtype: "Freelance", emoji: "🖥️", roles: ["Designer", "Developer", "Writer", "Consultant"], achievements: ["10+ Clients", "Recurring Revenue", "Featured Work"] },
    ],
  },
  {
    key: "Other",
    label: "Other",
    emoji: "✨",
    templates: [
      { subtype: "Other", emoji: "🌟", roles: ["Member", "Lead", "Founder"], achievements: ["Sustained Involvement", "Notable Recognition"] },
    ],
  },
];

export const SCOPE_LEVELS = [
  { value: "School", label: "School", emoji: "🏫" },
  { value: "City", label: "City / Regional", emoji: "🏙️" },
  { value: "National", label: "National", emoji: "🏳️" },
  { value: "International", label: "International", emoji: "🌍" },
] as const;

export type ScopeLevel = typeof SCOPE_LEVELS[number]["value"];
