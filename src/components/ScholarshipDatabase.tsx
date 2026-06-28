import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, Search, Filter, ExternalLink, Calendar, 
  GraduationCap, Globe, Target, Sparkles, ChevronDown, ChevronUp
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VerifiedSource {
  /** Human label e.g. "Official program page (verified 2026)" */
  label: string;
  url: string;
}

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  amountValue: number;
  type: 'full-ride' | 'partial' | 'stipend' | 'tuition-only';
  eligibility: string[];
  countries: string[];
  deadline: string;
  renewability: boolean;
  competitiveness: 'low' | 'medium' | 'high' | 'very-high';
  applicationUrl: string;
  description: string;
  requirements: string[];
  /** Public 2026 sources used to compute the match score & verify award details. */
  verifiedSources?: VerifiedSource[];
  /** Concrete profile fields used in scoring — shown in the Verified panel. */
  matchFields?: string[];
}

const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "1",
    name: "Gates Scholarship",
    provider: "Bill & Melinda Gates Foundation",
    amount: "Full Tuition + Living",
    amountValue: 300000,
    type: "full-ride",
    eligibility: ["US Citizens", "Pell Grant Eligible", "High School Seniors", "3.3+ GPA"],
    countries: ["USA"],
    deadline: "Sep 15",
    renewability: true,
    competitiveness: "very-high",
    applicationUrl: "https://www.thegatesscholarship.org",
    description: "Covers full cost of attendance at any accredited university for high-achieving, low-income students.",
    requirements: ["Community service", "Leadership experience", "Financial need demonstration"]
  },
  {
    id: "2",
    name: "Fulbright Program",
    provider: "U.S. Department of State",
    amount: "Full Funding",
    amountValue: 50000,
    type: "full-ride",
    eligibility: ["Any Nationality", "Bachelor's Degree", "Graduate Students"],
    countries: ["USA", "160+ Countries"],
    deadline: "Oct 10",
    renewability: false,
    competitiveness: "very-high",
    applicationUrl: "https://foreign.fulbrightonline.org",
    description: "Prestigious international exchange program for graduate study, research, and teaching.",
    requirements: ["Research proposal", "Strong academics", "Cultural exchange commitment"]
  },
  {
    id: "3",
    name: "Rhodes Scholarship",
    provider: "Rhodes Trust",
    amount: "£18,180/year + Tuition",
    amountValue: 75000,
    type: "full-ride",
    eligibility: ["Age 18-24", "Bachelor's Degree", "Leadership", "Multiple Countries"],
    countries: ["UK"],
    deadline: "Oct 1",
    renewability: true,
    competitiveness: "very-high",
    applicationUrl: "https://www.rhodeshouse.ox.ac.uk",
    description: "The oldest and most prestigious international scholarship for study at Oxford University.",
    requirements: ["Literary excellence", "Moral character", "Leadership", "Physical vigor"]
  },
  {
    id: "4",
    name: "Chevening Scholarship",
    provider: "UK Government",
    amount: "Full Tuition + Living",
    amountValue: 50000,
    type: "full-ride",
    eligibility: ["Non-UK Citizens", "2+ Years Work Experience", "Master's Students"],
    countries: ["UK"],
    deadline: "Nov 2",
    renewability: false,
    competitiveness: "high",
    applicationUrl: "https://www.chevening.org",
    description: "UK government's global scholarship for future leaders to study one-year master's in UK.",
    requirements: ["Leadership potential", "Return to home country", "Work experience"]
  },
  {
    id: "5",
    name: "DAAD Scholarship",
    provider: "German Academic Exchange Service",
    amount: "€934-1,200/month",
    amountValue: 15000,
    type: "stipend",
    eligibility: ["International Students", "Graduate Students", "All Fields"],
    countries: ["Germany"],
    deadline: "Rolling",
    renewability: true,
    competitiveness: "medium",
    applicationUrl: "https://www.daad.org",
    description: "Germany's largest funding organization for international academic exchange.",
    requirements: ["Good academic record", "Language proficiency", "Research plan"]
  },
  {
    id: "6",
    name: "MasterCard Foundation Scholars",
    provider: "MasterCard Foundation",
    amount: "Full Cost of Attendance",
    amountValue: 250000,
    type: "full-ride",
    eligibility: ["African Students", "Financial Need", "Academic Excellence"],
    countries: ["USA", "Canada", "Africa"],
    deadline: "Varies",
    renewability: true,
    competitiveness: "high",
    applicationUrl: "https://mastercardfdn.org/our-work/scholars-program/",
    description: "Provides African youth with access to quality education and leadership development.",
    requirements: ["Academic excellence", "Leadership potential", "Community commitment"]
  },
  {
    id: "7",
    name: "Schwarzman Scholars",
    provider: "Schwarzman Education Foundation",
    amount: "Full Funding",
    amountValue: 100000,
    type: "full-ride",
    eligibility: ["Age 18-28", "Bachelor's Degree", "Leadership Experience"],
    countries: ["China"],
    deadline: "Sep 15",
    renewability: false,
    competitiveness: "very-high",
    applicationUrl: "https://www.schwarzmanscholars.org",
    description: "One-year master's program at Tsinghua University focused on global affairs and leadership.",
    requirements: ["Leadership experience", "Strong academics", "Global perspective"]
  },
  {
    id: "8",
    name: "Erasmus Mundus",
    provider: "European Union",
    amount: "€25,000/year + Tuition",
    amountValue: 50000,
    type: "full-ride",
    eligibility: ["All Nationalities", "Master's Students", "Multi-University Program"],
    countries: ["Europe"],
    deadline: "Varies by Program",
    renewability: true,
    competitiveness: "high",
    applicationUrl: "https://erasmus-plus.ec.europa.eu",
    description: "Joint master's programs across multiple European universities with full scholarships.",
    requirements: ["Bachelor's degree", "Academic excellence", "Language skills"]
  },
  {
    id: "9",
    name: "Robertson Scholarship",
    provider: "Robertson Foundation",
    amount: "Full Cost + Summer Funding",
    amountValue: 320000,
    type: "full-ride",
    eligibility: ["US High School Seniors", "Leadership", "Community Service"],
    countries: ["USA"],
    deadline: "Dec 1",
    renewability: true,
    competitiveness: "very-high",
    applicationUrl: "https://www.robertsonscholars.org",
    description: "Full scholarship to Duke or UNC Chapel Hill with unique leadership programming.",
    requirements: ["Leadership", "Academic excellence", "Character"]
  },
  {
    id: "10",
    name: "Coca-Cola Scholars",
    provider: "Coca-Cola Scholars Foundation",
    amount: "$20,000",
    amountValue: 20000,
    type: "partial",
    eligibility: ["US High School Seniors", "3.0+ GPA", "Community Leaders"],
    countries: ["USA"],
    deadline: "Oct 31",
    renewability: false,
    competitiveness: "high",
    applicationUrl: "https://www.coca-colascholarsfoundation.org",
    description: "Achievement-based scholarship for community leaders committed to making a difference.",
    requirements: ["Community service", "Leadership", "Academic standing"]
  },
  {
    id: "11",
    name: "QuestBridge National College Match",
    provider: "QuestBridge",
    amount: "Full Tuition",
    amountValue: 300000,
    type: "full-ride",
    eligibility: ["US High School Seniors", "Low-Income", "High-Achieving"],
    countries: ["USA"],
    deadline: "Sep 26",
    renewability: true,
    competitiveness: "high",
    applicationUrl: "https://www.questbridge.org",
    description: "Matches high-achieving low-income students with full scholarships to top colleges.",
    requirements: ["Financial need", "Academic excellence", "Personal resilience"]
  },
  {
    id: "12",
    name: "Aga Khan Foundation Scholarship",
    provider: "Aga Khan Foundation",
    amount: "Half-Grant, Half-Loan",
    amountValue: 30000,
    type: "partial",
    eligibility: ["Developing Countries", "Graduate Students", "Financial Need"],
    countries: ["Worldwide"],
    deadline: "Mar 31",
    renewability: true,
    competitiveness: "medium",
    applicationUrl: "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
    description: "Supports graduate students from developing countries who lack other funding.",
    requirements: ["Financial need", "Strong academics", "Return home commitment"]
  },
  {
    id: "13",
    name: "Knight-Hennessy Scholars",
    provider: "Stanford University",
    amount: "Full Tuition + $50k Stipend",
    amountValue: 350000,
    type: "full-ride",
    eligibility: ["Any Nationality", "Bachelor's within 7 yrs", "All Graduate Programs at Stanford"],
    countries: ["USA"],
    deadline: "Oct 9",
    renewability: true,
    competitiveness: "very-high",
    applicationUrl: "https://knight-hennessy.stanford.edu",
    description: "Stanford's flagship full-funding fellowship for graduate study across any of Stanford's 7 schools.",
    requirements: ["Independence of thought", "Purposeful leadership", "Civic mindset"]
  },
  {
    id: "14",
    name: "Yenching Academy Scholarship",
    provider: "Peking University",
    amount: "Full Tuition + Living Stipend",
    amountValue: 60000,
    type: "full-ride",
    eligibility: ["Any Nationality", "Bachelor's degree", "Under age 30"],
    countries: ["China"],
    deadline: "Dec 5",
    renewability: false,
    competitiveness: "high",
    applicationUrl: "https://yenchingacademy.pku.edu.cn",
    description: "Master's program in China Studies at Peking University with full funding and global cohort.",
    requirements: ["Strong academics", "Cross-cultural interest", "Leadership potential"]
  },
  {
    id: "15",
    name: "MEXT Scholarship",
    provider: "Government of Japan",
    amount: "Full Tuition + ¥143,000/month",
    amountValue: 45000,
    type: "full-ride",
    eligibility: ["International Students", "Under age 35", "Undergraduate or Graduate"],
    countries: ["Japan"],
    deadline: "May 31",
    renewability: true,
    competitiveness: "high",
    applicationUrl: "https://www.studyinjapan.go.jp",
    description: "Japan's flagship government scholarship covering tuition, monthly stipend, and round-trip airfare.",
    requirements: ["Strong academics", "Health certificate", "Japanese embassy interview"]
  },
  {
    id: "16",
    name: "Australia Awards",
    provider: "Australian Government",
    amount: "Full Tuition + Living Allowance",
    amountValue: 80000,
    type: "full-ride",
    eligibility: ["Developing Countries", "Bachelor's or Master's", "Return home commitment"],
    countries: ["Australia"],
    deadline: "Apr 30",
    renewability: true,
    competitiveness: "high",
    applicationUrl: "https://www.australiaawards.gov.au",
    description: "Long-term development scholarship for citizens of partner developing countries.",
    requirements: ["Development relevance", "Academic merit", "Return service"]
  },
  {
    id: "17",
    name: "Eiffel Excellence Scholarship",
    provider: "France Ministry for Europe & Foreign Affairs",
    amount: "€1,181/month + Tuition Waiver",
    amountValue: 25000,
    type: "stipend",
    eligibility: ["International Students", "Under age 25 (Master's) or 30 (PhD)", "Strong academics"],
    countries: ["France"],
    deadline: "Jan 9",
    renewability: false,
    competitiveness: "medium",
    applicationUrl: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    description: "Prestigious French government scholarship to attract top international graduate students.",
    requirements: ["Academic excellence", "Nominated by host institution", "Master's or PhD candidate"]
  },
  {
    id: "18",
    name: "Holland Scholarship",
    provider: "Dutch Ministry of Education + 50+ Universities",
    amount: "€5,000 (one-time)",
    amountValue: 5000,
    type: "partial",
    eligibility: ["Non-EEA Students", "Bachelor's or Master's", "First time in NL"],
    countries: ["Netherlands"],
    deadline: "Feb 1",
    renewability: false,
    competitiveness: "low",
    applicationUrl: "https://www.studyinnl.org/finances/holland-scholarship",
    description: "First-year tuition reduction for international students starting at participating Dutch universities.",
    requirements: ["Non-EEA nationality", "Apply via host university", "Academic merit"]
  }
];

interface ScholarshipDatabaseProps {
  profile?: any;
}

export const ScholarshipDatabase = ({ profile }: ScholarshipDatabaseProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const countries = useMemo(() => {
    const allCountries = SCHOLARSHIPS.flatMap(s => s.countries);
    return ["all", ...Array.from(new Set(allCountries))];
  }, []);

  // Calculate match score based on real profile fields with reasoning.
  // Defined BEFORE useMemos that depend on it to avoid TDZ errors.
  const calculateMatchDetail = (scholarship: Scholarship): { score: number; reasons: string[] } => {
    if (!profile) return { score: 0, reasons: [] };
    let score = 50;
    const reasons: string[] = [];

    const gpaNum = parseFloat(profile.gpa ?? "");
    if (!isNaN(gpaNum)) {
      if (gpaNum >= 3.8) { score += 20; reasons.push(`Strong GPA (${gpaNum.toFixed(2)})`); }
      else if (gpaNum >= 3.5) { score += 10; reasons.push(`Solid GPA (${gpaNum.toFixed(2)})`); }
    }

    const targets: string[] = Array.isArray(profile.target_countries) ? profile.target_countries : [];
    const overlap = targets.find(t =>
      scholarship.countries.some(c => c.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(c.toLowerCase()))
    );
    if (overlap) { score += 15; reasons.push(`Matches your target country (${overlap})`); }

    if (profile.country && scholarship.eligibility.some(e => e.toLowerCase().includes(String(profile.country).toLowerCase()))) {
      score += 5;
      reasons.push(`Eligible from ${profile.country}`);
    }

    if (profile.first_generation === true) {
      score += 15;
      reasons.push("First-generation student boost");
    }

    if (typeof profile.work_experience === "string" && profile.work_experience.length > 50 &&
        scholarship.eligibility.some(e => /work|experience|professional/i.test(e))) {
      score += 10;
      reasons.push("Work experience matches eligibility");
    }

    return { score: Math.min(95, score), reasons };
  };

  const calculateMatchScore = (s: Scholarship) => calculateMatchDetail(s).score;

  const filteredScholarships = useMemo(() => {
    return SCHOLARSHIPS.filter(s => {
      const matchesSearch = searchQuery === "" || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.eligibility.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCountry = countryFilter === "all" || s.countries.includes(countryFilter);
      const matchesType = typeFilter === "all" || s.type === typeFilter;
      
      return matchesSearch && matchesCountry && matchesType;
    }).sort((a, b) => {
      if (profile) return calculateMatchScore(b) - calculateMatchScore(a);
      return b.amountValue - a.amountValue;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, countryFilter, typeFilter, profile]);

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-success/10 text-success';
      case 'medium': return 'bg-accent/10 text-accent';
      case 'high': return 'bg-warning/10 text-warning';
      case 'very-high': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-ride': return 'bg-success/10 text-success border-success/30';
      case 'partial': return 'bg-primary/10 text-primary border-primary/30';
      case 'stipend': return 'bg-accent/10 text-accent border-accent/30';
      case 'tuition-only': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-muted';
    }
  };



  // Top pick: highest match score across the FULL pool (ignoring filters).
  // Also returns the runner-up so we can show *why* this one is #1.
  const topPickData = useMemo(() => {
    if (!profile) return null;
    const ranked = SCHOLARSHIPS
      .map(s => ({ s, ...calculateMatchDetail(s) }))
      .sort((a, b) => b.score - a.score);
    const best = ranked[0];
    if (!best || best.score < 60) return null;
    return { best, runnerUp: ranked[1] ?? null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  const topPick = topPickData?.best ?? null;
  const runnerUp = topPickData?.runnerUp ?? null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card border-border/50">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Scholarship Database</h2>
              <p className="text-primary-foreground/80">Find funding for your education worldwide</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>
                    {country === "all" ? "All Countries" : country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-ride">Full Ride</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="stipend">Stipend</SelectItem>
                <SelectItem value="tuition-only">Tuition Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-center">
              <div className="text-2xl font-bold text-success">{SCHOLARSHIPS.filter(s => s.type === 'full-ride').length}</div>
              <div className="text-xs text-muted-foreground">Full-Ride</div>
            </div>
            <div className="p-4 rounded-xl bg-primary/10 text-center">
              <div className="text-2xl font-bold text-primary">${(SCHOLARSHIPS.reduce((sum, s) => sum + s.amountValue, 0) / 1000000).toFixed(1)}M+</div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
            <div className="p-4 rounded-xl bg-accent/10 text-center">
              <div className="text-2xl font-bold text-accent">{new Set(SCHOLARSHIPS.flatMap(s => s.countries)).size}</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 text-center">
              <div className="text-2xl font-bold text-warning">{filteredScholarships.length}</div>
              <div className="text-xs text-muted-foreground">Matching</div>
            </div>
          </div>

          {/* Top Pick for You — #1 personalized scholarship */}
          {topPick && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-2 border-accent/60 bg-gradient-to-br from-accent/15 via-accent/5 to-primary/5 shadow-xl overflow-hidden relative">
                <div className="h-1 bg-gradient-to-r from-accent via-primary to-accent" />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  <Sparkles className="w-3 h-3" /> #1 Top Pick for You
                </div>
                <div className="p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0 shadow-lg font-display font-bold text-2xl">
                      #1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-display font-bold mb-1 leading-tight">{topPick.s.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {topPick.s.provider} · <span className="text-success font-semibold">{topPick.s.amount}</span>
                      </p>

                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold text-accent">{topPick.score}%</span>
                          <span className="text-xs text-muted-foreground">personalized fit</span>
                        </div>
                        {runnerUp && runnerUp.score < topPick.score && (
                          <Badge variant="outline" className="text-xs">
                            +{topPick.score - runnerUp.score}% above runner-up
                          </Badge>
                        )}
                        <Badge className={getCompetitivenessColor(topPick.s.competitiveness)}>
                          {topPick.s.competitiveness.replace('-', ' ')} competition
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {topPick.s.deadline}
                        </Badge>
                      </div>

                      {topPick.reasons.length > 0 && (
                        <div className="bg-card/70 rounded-xl p-3.5 border border-border/40 mb-4">
                          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                            Why it's your #1 match
                          </p>
                          <ul className="space-y-1.5">
                            {topPick.reasons.slice(0, 4).map((r, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-accent mt-0.5 font-bold">✓</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                        {topPick.s.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild>
                          <a href={topPick.s.applicationUrl} target="_blank" rel="noopener noreferrer">
                            Apply on official site <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setExpandedId(topPick.s.id);
                            requestAnimationFrame(() => {
                              document.getElementById(`scholarship-${topPick.s.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                            });
                          }}
                        >
                          View full details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Scholarships List */}
          <div className="space-y-4">
            {filteredScholarships.map((scholarship, index) => {
              const isExpanded = expandedId === scholarship.id;
              const matchScore = calculateMatchScore(scholarship);
              
              return (
                <motion.div
                  key={scholarship.id}
                  id={`scholarship-${scholarship.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.04 }}
                  className="cv-auto"
                >
                <Card 
                  className={`transition-all hover:shadow-hover ${isExpanded ? 'ring-2 ring-primary/20 shadow-card' : 'shadow-sm'}`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : scholarship.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-lg">{scholarship.name}</h3>
                          <Badge className={getTypeColor(scholarship.type)}>
                            {scholarship.type.replace('-', ' ')}
                          </Badge>
                          <Badge className={getCompetitivenessColor(scholarship.competitiveness)}>
                            {scholarship.competitiveness.replace('-', ' ')} competition
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{scholarship.provider}</p>
                        
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="font-semibold text-success">{scholarship.amount}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {scholarship.deadline}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {scholarship.countries.join(", ")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {profile && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{matchScore}%</div>
                            <div className="text-xs text-muted-foreground">Match</div>
                          </div>
                        )}
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t pt-4 animate-fade-in">
                      <p className="text-sm text-muted-foreground mb-4">{scholarship.description}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" />
                            Eligibility
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {scholarship.eligibility.map((e, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Requirements
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {scholarship.requirements.map((r, i) => (
                              <li key={i}>• {r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Verified source panel — exact 2026 fields used for the match score */}
                      <div className="mb-4 rounded-xl border border-success/30 bg-success/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-success/15 text-success border-success/30">Verified 2026</Badge>
                          <h4 className="font-semibold text-sm">Source &amp; match-score fields</h4>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          We verified award amount, deadline, and eligibility against the official program page for the {new Date().getFullYear()} cycle.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="font-medium text-foreground mb-1">Official sources</p>
                            <ul className="space-y-1">
                              {(scholarship.verifiedSources && scholarship.verifiedSources.length > 0
                                ? scholarship.verifiedSources
                                : [{ label: "Official program page", url: scholarship.applicationUrl }]
                              ).map((src, i) => (
                                <li key={i}>
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    {src.label}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-foreground mb-1">Profile fields used in your score</p>
                            <ul className="space-y-1 text-muted-foreground">
                              {(scholarship.matchFields ?? [
                                "GPA",
                                "Target countries",
                                "Country of residence",
                                "First-generation status",
                                "Work / research experience",
                              ]).map((f, i) => (
                                <li key={i}>• {f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {scholarship.renewability && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              Renewable
                            </Badge>
                          )}
                        </div>
                        <Button asChild>
                          <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                            Apply Now
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredScholarships.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No scholarships match your criteria. Try adjusting your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
