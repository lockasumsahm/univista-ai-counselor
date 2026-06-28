import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe, Plane, FileText, Clock, Briefcase, GraduationCap,
  DollarSign, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Shield,
  MessageCircle, Send, Loader2, Bot, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import ReactMarkdown from "react-markdown";

interface VisaInfo {
  country: string;
  flag: string;
  visaType: string;
  processingTime: string;
  cost: string;
  requirements: string[];
  postGradOptions: { name: string; duration: string; description: string }[];
  workRights: string;
  tips: string[];
  difficulty: "Easy" | "Moderate" | "Complex";
}

const VISA_DATA: VisaInfo[] = [
  {
    country: "United States", flag: "🇺🇸", visaType: "F-1 Student Visa", processingTime: "3-5 months",
    cost: "$185 SEVIS + $160 visa fee",
    requirements: ["I-20 form from university","SEVIS fee payment (I-901)","Valid passport (6+ months)","Financial proof ($50,000+/year)","DS-160 application","Visa interview at US Embassy","Academic transcripts","English proficiency (TOEFL/IELTS)"],
    postGradOptions: [
      { name: "OPT", duration: "12 months", description: "Optional Practical Training allows work in your field of study" },
      { name: "STEM OPT Extension", duration: "24 months", description: "Additional 24 months for STEM graduates (total 36 months)" },
      { name: "H-1B Visa", duration: "3-6 years", description: "Employer-sponsored work visa with lottery system" },
      { name: "CPT", duration: "During studies", description: "Curricular Practical Training for internships" },
    ],
    workRights: "20 hrs/week during term, 40 hrs/week during breaks (on-campus first year)",
    tips: ["Apply for visa early — embassy wait times can be 2+ months","Prepare strong ties to home country for visa interview","Keep I-20 and passport up to date at all times","Start OPT application 90 days before graduation"],
    difficulty: "Complex",
  },
  {
    country: "United Kingdom", flag: "🇬🇧", visaType: "Student Visa (Tier 4)", processingTime: "3-6 weeks",
    cost: "£363 + Immigration Health Surcharge (£470/year)",
    requirements: ["CAS (Confirmation of Acceptance for Studies)","Financial proof (£1,334/month London, £1,023 outside)","Valid passport","TB test (some countries)","English proficiency (IELTS/PTE)","Academic qualifications"],
    postGradOptions: [
      { name: "Graduate Route", duration: "2 years (3 for PhD)", description: "Work in any job after completing degree" },
      { name: "Skilled Worker Visa", duration: "5 years", description: "Employer-sponsored route with salary threshold" },
      { name: "High Potential Individual", duration: "2 years", description: "For graduates of top global universities" },
    ],
    workRights: "20 hrs/week during term, full-time during holidays",
    tips: ["Apply up to 6 months before course starts","Open a UK bank account early for financial proof","Register with police within 7 days if required","Graduate Route is one of the most generous post-study work visas globally"],
    difficulty: "Moderate",
  },
  {
    country: "Canada", flag: "🇨🇦", visaType: "Study Permit", processingTime: "4-16 weeks", cost: "CAD $150",
    requirements: ["Letter of acceptance from DLI","Proof of funds (CAD $20,636/year + tuition)","Valid passport","Immigration medical exam","Police clearance certificate","Statement of purpose","English/French proficiency"],
    postGradOptions: [
      { name: "PGWP", duration: "Up to 3 years", description: "Post-Graduation Work Permit matching study duration" },
      { name: "Express Entry", duration: "Permanent", description: "Points-based PR pathway with CRS scoring" },
      { name: "Provincial Nominee", duration: "Permanent", description: "Province-specific immigration programs" },
    ],
    workRights: "20 hrs/week during term, full-time during breaks",
    tips: ["Canada has one of the best study-to-PR pathways globally","Co-op programs can strengthen your PGWP application","Some provinces have lower tuition and cost of living","Apply for SIN immediately upon arrival to work legally"],
    difficulty: "Moderate",
  },
  {
    country: "Australia", flag: "🇦🇺", visaType: "Student Visa (Subclass 500)", processingTime: "4-6 weeks", cost: "AUD $710",
    requirements: ["CoE (Confirmation of Enrolment)","GTE (Genuine Temporary Entrant) statement","Financial proof (AUD $24,505/year)","OSHC health insurance","English proficiency (IELTS 5.5+)","Valid passport","Health examination"],
    postGradOptions: [
      { name: "Temporary Graduate Visa (485)", duration: "2-4 years", description: "Post-study work stream based on qualification level" },
      { name: "Skilled Migration", duration: "Permanent", description: "Points-based PR through skilled occupation list" },
      { name: "Employer Sponsored", duration: "2-4 years", description: "TSS visa sponsored by Australian employer" },
    ],
    workRights: "Unlimited hours during studies (as of 2024)",
    tips: ["Australia now allows unlimited work hours for students","Regional universities offer immigration advantages","Healthcare is covered by mandatory OSHC insurance","Consider professional year programs for extra PR points"],
    difficulty: "Moderate",
  },
  {
    country: "Germany", flag: "🇩🇪", visaType: "Student Visa (National Visa)", processingTime: "6-12 weeks", cost: "€75",
    requirements: ["University admission letter","Blocked account (€11,208/year)","Health insurance","Valid passport","Academic qualifications with apostille","German/English proficiency","Motivation letter"],
    postGradOptions: [
      { name: "Job Seeker Visa", duration: "18 months", description: "Stay to find a job after graduation" },
      { name: "EU Blue Card", duration: "4 years", description: "For qualified professionals with job offer" },
      { name: "Settlement Permit", duration: "Permanent", description: "After 2 years with EU Blue Card" },
    ],
    workRights: "120 full days or 240 half days per year",
    tips: ["Most public universities have ZERO tuition (only semester fees ~€300)","Open a blocked account (Sperrkonto) before applying","Learning German significantly improves job prospects","Register at local Ausländerbehörde within 2 weeks of arrival"],
    difficulty: "Moderate",
  },
  {
    country: "Netherlands", flag: "🇳🇱", visaType: "MVV + Residence Permit", processingTime: "2-3 months", cost: "€210",
    requirements: ["University admission","Proof of funds (€13,800/year for 2026)","Valid passport","Health insurance","Legalized diplomas","English proficiency"],
    postGradOptions: [
      { name: "Orientation Year", duration: "12 months", description: "Search for work or start a business after graduation" },
      { name: "Highly Skilled Migrant", duration: "5 years", description: "Reduced salary threshold for recent graduates" },
    ],
    workRights: "16 hrs/week with work permit, full-time June-August",
    tips: ["Dutch universities process your visa — you don't apply directly","Orientation year has reduced salary threshold for job seekers","Most Dutch people speak excellent English","Register with municipality (gemeente) upon arrival"],
    difficulty: "Easy",
  },
  {
    country: "Ireland", flag: "🇮🇪", visaType: "Stamp 2 Student Visa", processingTime: "4-8 weeks", cost: "€60 (single) / €100 (multi-entry)",
    requirements: ["Letter of acceptance","Proof of funds (€10,000/year + tuition)","Valid passport","Private health insurance","English proficiency","Tuition paid in full"],
    postGradOptions: [
      { name: "Third Level Graduate Programme", duration: "24 months (Master's/PhD)", description: "Stay and work after graduation under Stamp 1G" },
      { name: "Critical Skills Employment Permit", duration: "2 years → PR", description: "Fast-track to permanent residence in shortage occupations" },
    ],
    workRights: "20 hrs/week during term, 40 hrs/week during breaks",
    tips: ["Apply for PPS number on arrival to work legally","Ireland is the only English-speaking country in the EU post-Brexit","Tech, pharma, and finance hire heavily from graduates","Register with GNIB within 90 days of arrival"],
    difficulty: "Moderate",
  },
  {
    country: "France", flag: "🇫🇷", visaType: "VLS-TS Étudiant", processingTime: "2-4 weeks", cost: "€99 + €50 OFII fee",
    requirements: ["Acceptance via Campus France","Proof of funds (€7,800/year)","Valid passport","Health insurance","Accommodation proof","French/English proficiency"],
    postGradOptions: [
      { name: "APS (Job Search Visa)", duration: "12 months", description: "Search for work in your field after Master's/PhD" },
      { name: "Talent Passport", duration: "4 years", description: "For qualified graduates with job offers above salary threshold" },
    ],
    workRights: "964 hrs/year (≈20 hrs/week)",
    tips: ["Public universities charge only €170-380/year for EU students, €2,770-3,770 for non-EU","Apply via Études en France platform","CAF housing assistance available even for international students","Learn basic French — even in English-taught programs"],
    difficulty: "Moderate",
  },
  {
    country: "Spain", flag: "🇪🇸", visaType: "Student Visa (Type D)", processingTime: "1-3 months", cost: "€80",
    requirements: ["University admission letter","Proof of funds (€600/month, €7,200/year)","Valid passport","Health insurance","Criminal record certificate","Medical certificate"],
    postGradOptions: [
      { name: "Job Search Residency", duration: "12 months", description: "Stay to find work or start a business after studies" },
      { name: "Highly Qualified Professional", duration: "2-5 years", description: "EU Blue Card route for graduates with job offers" },
    ],
    workRights: "30 hrs/week with work authorization",
    tips: ["Spain is one of the cheapest EU countries for students","Many cities offer affordable housing under €400/month","Learning Spanish dramatically improves job prospects","Apply for TIE card within 30 days of arrival"],
    difficulty: "Easy",
  },
  {
    country: "Italy", flag: "🇮🇹", visaType: "Type D Student Visa", processingTime: "1-3 months", cost: "€50",
    requirements: ["Letter of acceptance from MUR-recognized university","Proof of funds (€6,500/year minimum)","Valid passport","Health insurance","Accommodation proof","Italian/English proficiency"],
    postGradOptions: [
      { name: "Permesso di Soggiorno per Attesa Occupazione", duration: "12 months", description: "Job search permit after graduation" },
      { name: "EU Blue Card Italy", duration: "2 years renewable", description: "For qualified workers with job offers" },
    ],
    workRights: "20 hrs/week, max 1,040 hrs/year",
    tips: ["Public universities charge €1,000-4,000/year — among the lowest in Western Europe","DSU regional grants available for low-income students","Apply for codice fiscale (tax code) immediately on arrival","Many master's programs are taught fully in English"],
    difficulty: "Moderate",
  },
  {
    country: "Sweden", flag: "🇸🇪", visaType: "Residence Permit for Studies", processingTime: "2-3 months", cost: "SEK 1,500 (~€135)",
    requirements: ["Acceptance letter","Proof of funds (SEK 10,584/month, ~€935)","Valid passport","Comprehensive health insurance","Tuition paid for first semester"],
    postGradOptions: [
      { name: "Job Search Permit", duration: "12 months", description: "Stay after graduation to find work or start business" },
      { name: "Work Permit", duration: "2 years renewable", description: "Standard skilled worker route, leads to PR after 4 years" },
    ],
    workRights: "Unlimited hours during studies",
    tips: ["Tuition is FREE for EU/EEA citizens; €9,000-15,000/year for non-EU","Most master's programs are taught in English","Register at Skatteverket for personal number on arrival","Sweden has excellent post-study integration programs"],
    difficulty: "Moderate",
  },
  {
    country: "Switzerland", flag: "🇨🇭", visaType: "National D Visa + Residence Permit", processingTime: "8-12 weeks", cost: "CHF 88 (~€95)",
    requirements: ["University acceptance","Proof of funds (CHF 21,000/year, ~€22,500)","Valid passport","Health insurance (mandatory LAMal)","Accommodation proof","Language proficiency (German/French/Italian/English)"],
    postGradOptions: [
      { name: "Job Search Permit", duration: "6 months", description: "Stay to find work after graduation" },
      { name: "Work Permit B", duration: "1-5 years", description: "Quota-based, easier for highly qualified graduates" },
    ],
    workRights: "15 hrs/week during term, full-time during holidays (after 6 months)",
    tips: ["Public universities charge CHF 500-2,000/semester — far below private rates","High living costs offset by high salaries (~CHF 70k+ entry-level)","Switzerland has 4 official languages — choose region carefully","ETH Zurich and EPFL rank in global top 20"],
    difficulty: "Complex",
  },
  {
    country: "Japan", flag: "🇯🇵", visaType: "Student Visa (Ryugaku)", processingTime: "1-3 months", cost: "¥3,000-6,000 (~€20-40)",
    requirements: ["Certificate of Eligibility (COE) from school","Proof of funds (¥1.5-2M/year, ~€10-13k)","Valid passport","Academic transcripts","Japanese/English proficiency","Application via Japanese embassy"],
    postGradOptions: [
      { name: "Designated Activities (Job Search)", duration: "12 months", description: "Renewable visa to find work after graduation" },
      { name: "Highly Skilled Professional", duration: "5 years → PR in 1-3 years", description: "Points-based route, fastest path to Japanese PR" },
    ],
    workRights: "28 hrs/week during term, 40 hrs/week during breaks (with permit)",
    tips: ["MEXT Scholarship covers tuition + living + flights for top international students","JLPT N2+ dramatically improves job prospects","Many universities now offer English-taught degrees","Register at city ward office within 14 days of arrival"],
    difficulty: "Moderate",
  },
  {
    country: "South Korea", flag: "🇰🇷", visaType: "D-2 Student Visa", processingTime: "2-4 weeks", cost: "₩60,000 (~€40)",
    requirements: ["University admission letter","Proof of funds ($10,000/year)","Valid passport","Academic transcripts","TOPIK/English proficiency","Bank statements"],
    postGradOptions: [
      { name: "D-10 Job Seeker Visa", duration: "6 months (extendable to 2 years)", description: "Stay to find work after graduation" },
      { name: "E-7 Skilled Worker", duration: "Up to 3 years renewable", description: "Standard work visa, leads to F-2 residency" },
    ],
    workRights: "20 hrs/week during term, unlimited during breaks",
    tips: ["Government Scholarship Program (KGSP/GKS) covers full tuition + stipend","TOPIK Level 4+ unlocks most job opportunities","Many universities offer English-taught engineering programs","Tech, K-pop industries, and chaebols (Samsung, LG) actively recruit graduates"],
    difficulty: "Moderate",
  },
  {
    country: "Singapore", flag: "🇸🇬", visaType: "Student's Pass", processingTime: "2-4 weeks", cost: "S$90 (issuance) + S$60 (multi-entry visa)",
    requirements: ["IPA letter from ICA","University acceptance","Proof of funds (S$30,000+)","Valid passport","Medical examination","English proficiency"],
    postGradOptions: [
      { name: "Long Term Visit Pass (LTVP)", duration: "12 months", description: "Stay to find employment after graduation" },
      { name: "Employment Pass", duration: "1-2 years renewable", description: "For graduates earning S$5,000+/month, leads to PR" },
    ],
    workRights: "16 hrs/week during term (NUS/NTU/SMU only), unlimited during breaks",
    tips: ["NUS and NTU consistently rank in global top 20","Singapore-government tuition grant cuts costs by ~50% with 3-year work bond","Strong start-up scene and global tech HQ presence","English is the working language — no Mandarin required"],
    difficulty: "Moderate",
  },
  {
    country: "United Arab Emirates", flag: "🇦🇪", visaType: "Student Residence Visa", processingTime: "2-4 weeks", cost: "AED 1,200-3,000 (~€300-750)",
    requirements: ["University acceptance","Proof of funds","Valid passport (6+ months)","Medical fitness test","Emirates ID application","Health insurance"],
    postGradOptions: [
      { name: "Green Visa", duration: "5 years", description: "Self-sponsored visa for graduates, no employer needed" },
      { name: "Golden Visa", duration: "10 years", description: "For top-graduates from accredited universities (GPA 3.5+)" },
    ],
    workRights: "Part-time work allowed with employer NOC and approval",
    tips: ["Zero income tax for graduates","Dubai and Abu Dhabi host campuses of NYU, Sorbonne, Heriot-Watt","Strong demand in tech, finance, and aerospace","Golden Visa is one of the most generous post-study routes globally"],
    difficulty: "Easy",
  },
];

const DIFFICULTY_COLORS = {
  Easy: "bg-success/10 text-success border-success/30",
  Moderate: "bg-warning/10 text-warning border-warning/30",
  Complex: "bg-destructive/10 text-destructive border-destructive/30",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const VisaGuide = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>(VISA_DATA[0].country);
  const [compareCountry, setCompareCountry] = useState<string>(VISA_DATA[1].country);
  const [compareMode, setCompareMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["requirements", "postgrad"]));
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const { toast } = useToast();

  const filteredCountries = VISA_DATA.filter(v =>
    v.country.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );
  const visa = VISA_DATA.find(v => v.country === selectedCountry) || VISA_DATA[0];
  const visaB = VISA_DATA.find(v => v.country === compareCountry) || VISA_DATA[1];

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Scroll only inside the chat container — never scroll the page.
  useEffect(() => {
    if (chatContainerRef.current && (chatMessages.length > 0 || chatLoading)) {
      const el = chatContainerRef.current;
      // requestAnimationFrame ensures DOM has updated before scrolling
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [chatMessages, chatLoading]);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: question }]);
    setChatLoading(true);

    try {
      const { data, status } = await invokeEdgeFunction("university-counselor", {
        action: "visaQA",
        profile: profile || { gpa: "N/A", extracurriculars: "N/A" },
        cvText: `[Country context: ${selectedCountry}] ${question}`,
      });

      if (status !== 200 || !data) {
        setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't get an answer right now. Please try again." }]);
        return;
      }

      const answer = data?.result?.answer || data?.answer || (typeof data === 'string' ? data : "I couldn't generate an answer. Please try rephrasing your question.");
      setChatMessages(prev => [...prev, { role: "assistant", content: answer }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const SectionToggle = ({ sectionKey, title, icon: Icon, children }: { sectionKey: string; title: string; icon: typeof Globe; children: React.ReactNode }) => {
    const isOpen = expandedSections.has(sectionKey);
    return (
      <Card className="border-border/50">
        <button onClick={() => toggleSection(sectionKey)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
            <h3 className="font-semibold">{title}</h3>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="px-4 pb-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  };

  const SUGGESTED_QUESTIONS = [
    "What if I don't have a bank statement for the visa?",
    "How to apply for a student visa step by step?",
    "Can I work while studying?",
    "What happens if my visa gets rejected?",
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <Plane className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Visa & Immigration Guide</h2>
              <p className="text-primary-foreground/80">Everything you need to know about student visas and post-graduation pathways</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 md:max-w-xs">
              <Input
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
                aria-label="Search visa countries"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Country:</span>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(filteredCountries.length ? filteredCountries : VISA_DATA).map(v => (
                    <SelectItem key={v.country} value={v.country}>{v.flag} {v.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant={compareMode ? "default" : "outline"}
              size="sm"
              onClick={() => setCompareMode(v => !v)}
              className="md:ml-auto"
            >
              {compareMode ? "Exit Compare" : "Compare two countries"}
            </Button>
          </div>

          {compareMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Compare with:</span>
              <Select value={compareCountry} onValueChange={setCompareCountry}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VISA_DATA.filter(v => v.country !== selectedCountry).map(v => (
                    <SelectItem key={v.country} value={v.country}>{v.flag} {v.country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {compareMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[visa, visaB].map((c, idx) => (
                <Card key={idx} className="p-5 border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{c.flag} {c.country}</h3>
                    <Badge className={DIFFICULTY_COLORS[c.difficulty]}>{c.difficulty}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-muted/30"><p className="text-muted-foreground">Visa</p><p className="font-medium text-sm">{c.visaType}</p></div>
                    <div className="p-2 rounded-lg bg-muted/30"><p className="text-muted-foreground">Processing</p><p className="font-medium text-sm">{c.processingTime}</p></div>
                    <div className="p-2 rounded-lg bg-muted/30 col-span-2"><p className="text-muted-foreground">Cost</p><p className="font-medium text-sm">{c.cost}</p></div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Work Rights</p>
                    <p className="text-sm">{c.workRights}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Top Post-Grad Routes</p>
                    <ul className="space-y-1">
                      {c.postGradOptions.slice(0, 2).map((opt, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                          <span><strong>{opt.name}</strong> · <span className="text-muted-foreground">{opt.duration}</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Top Requirements</p>
                    <ul className="space-y-1">
                      {c.requirements.slice(0, 3).map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-4 text-center border-border/50"><FileText className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-sm font-semibold">{visa.visaType}</p><p className="text-xs text-muted-foreground">Visa Type</p></Card>
                <Card className="p-4 text-center border-border/50"><Clock className="w-5 h-5 mx-auto mb-1 text-warning" /><p className="text-sm font-semibold">{visa.processingTime}</p><p className="text-xs text-muted-foreground">Processing</p></Card>
                <Card className="p-4 text-center border-border/50"><DollarSign className="w-5 h-5 mx-auto mb-1 text-success" /><p className="text-sm font-semibold">{visa.cost}</p><p className="text-xs text-muted-foreground">Cost</p></Card>
                <Card className="p-4 text-center border-border/50"><Shield className="w-5 h-5 mx-auto mb-1 text-accent" /><Badge className={DIFFICULTY_COLORS[visa.difficulty]}>{visa.difficulty}</Badge><p className="text-xs text-muted-foreground mt-1">Difficulty</p></Card>
              </div>

              <Card className="p-4 bg-accent/5 border-accent/20">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-accent" />
                  <div><p className="font-semibold text-sm">Work Rights During Studies</p><p className="text-sm text-muted-foreground">{visa.workRights}</p></div>
                </div>
              </Card>

              <SectionToggle sectionKey="requirements" title="Visa Requirements" icon={FileText}>
                <div className="space-y-2">
                  {visa.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span className="text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </SectionToggle>

              <SectionToggle sectionKey="postgrad" title="Post-Graduation Pathways" icon={GraduationCap}>
                <div className="space-y-3">
                  {visa.postGradOptions.map((opt, i) => (
                    <Card key={i} className="p-4 border-border/50 bg-muted/10">
                      <div className="flex items-center justify-between mb-2"><h4 className="font-semibold text-sm">{opt.name}</h4><Badge variant="outline">{opt.duration}</Badge></div>
                      <p className="text-sm text-muted-foreground">{opt.description}</p>
                    </Card>
                  ))}
                </div>
              </SectionToggle>

              <SectionToggle sectionKey="tips" title="Pro Tips" icon={AlertTriangle}>
                <div className="space-y-2">
                  {visa.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-2"><span className="text-warning mt-0.5">💡</span><span className="text-sm">{tip}</span></div>
                  ))}
                </div>
              </SectionToggle>
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Visa Q&A Section */}
      <Card className="border-border/50 overflow-hidden">
        <button onClick={() => setChatOpen(!chatOpen)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" /></div>
            <div className="text-left">
              <h3 className="font-semibold">Ask AI About Visas</h3>
              <p className="text-xs text-muted-foreground">Get instant answers to your visa & immigration questions</p>
            </div>
          </div>
          {chatOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {chatOpen && (
          <div className="px-4 pb-4 space-y-4">
            {/* Suggested Questions */}
            {chatMessages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => { setChatInput(q); }}>
                    {q}
                  </Button>
                ))}
              </div>
            )}

            {/* Chat Messages */}
            <div ref={chatContainerRef} className="max-h-80 overflow-y-auto space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <Bot className="w-5 h-5 text-primary mt-1 flex-shrink-0" />}
                  <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                  {msg.role === "user" && <User className="w-5 h-5 text-accent mt-1 flex-shrink-0" />}
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2">
                  <Bot className="w-5 h-5 text-primary mt-1" />
                  <div className="bg-muted rounded-xl px-4 py-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask about visa, work rights, immigration..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                disabled={chatLoading}
              />
              <Button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} size="icon" aria-label="Send message">
                {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VisaGuide;
