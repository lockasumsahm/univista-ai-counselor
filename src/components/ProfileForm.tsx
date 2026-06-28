import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, User, Mail, Award, BookOpen, FileText, ArrowRight, CheckCircle2, HelpCircle, Trophy, Users, MapPin, GraduationCap, Palette, Heart } from "lucide-react";
import { PersonalContext, defaultPersonalContext, type PersonalContextData } from "./PersonalContext";
import { CountrySelector } from "./CountrySelector";
import { ApCourseSelector } from "./ApCourseSelector";
import { LocationSelector } from "./LocationSelector";
import { ActivityList } from "./activity/ActivityList";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ProfileData {
  name: string;
  email: string;
  gpa: string;
  testScores: string;
  extracurriculars: string;
  courseRigor: string;
  apIbCourses: string;
  legacyStatus: string;
  firstGenStatus: string;
  athleticsStatus: string;
  artsPortfolio: string;
  demonstratedInterest: string;
  geographicLocation: string;
  essayStrength: string;
  recommendationStrength: string;
  personalContext: PersonalContextData;
  preferredCountries: string[];
  cv: File | null;
  // Country-specific fields
  aLevelGrades: string;
  predictedGrades: string;
  gaokaoScore: string;
  nationalExamType: string;
  nationalExamScore: string;
  baccalaureateScore: string;
  // Additional profile fields
  researchExperience: string;
  volunteerHours: string;
  workExperience: string;
  intendedMajor: string;
}

interface FieldLabelProps {
  htmlFor: string;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
  isComplete: boolean;
}

const FieldLabel = ({ htmlFor, icon, label, tooltip, isComplete }: FieldLabelProps) => (
  <Label htmlFor={htmlFor} className="flex items-center gap-2 text-foreground font-medium">
    {icon}
    {label}
    <Tooltip>
      <TooltipTrigger
        type="button"
        className="inline-flex items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${label} help`}
        onClick={(e) => e.stopPropagation()}
      >
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
    {isComplete && <CheckCircle2 className="w-4 h-4 text-success ml-auto" />}
  </Label>
);

interface ProfileFormProps {
  onSubmit: (data: ProfileData) => void;
  initialData?: ProfileData;
}

export const ProfileForm = ({ onSubmit, initialData }: ProfileFormProps) => {
  const { t } = useLanguage();
  
  const FACTOR_TOOLTIPS = {
    gpa: t('profile.gpaTooltip') !== 'profile.gpaTooltip' ? t('profile.gpaTooltip') : "Your cumulative GPA on a 4.0 scale (unweighted). Include grade trend if relevant.",
    testScores: t('profile.testScoresTooltip') !== 'profile.testScoresTooltip' ? t('profile.testScoresTooltip') : "Include SAT (out of 1600), ACT (out of 36), or other standardized test scores.",
    courseRigor: t('profile.courseRigorTooltip') !== 'profile.courseRigorTooltip' ? t('profile.courseRigorTooltip') : "The level of difficulty of your high school curriculum.",
    apIbCourses: t('profile.apIbTooltip') !== 'profile.apIbTooltip' ? t('profile.apIbTooltip') : "Number of AP or IB courses you've taken or are taking.",
    extracurriculars: t('profile.extracurricularsTooltip') !== 'profile.extracurricularsTooltip' ? t('profile.extracurricularsTooltip') : "List your activities with depth of involvement, years participated, and leadership roles.",
    legacyStatus: t('profile.legacyTooltip') !== 'profile.legacyTooltip' ? t('profile.legacyTooltip') : "Whether your parents or siblings attended the university you're applying to.",
    firstGenStatus: t('profile.firstGenTooltip') !== 'profile.firstGenTooltip' ? t('profile.firstGenTooltip') : "Whether you would be the first in your immediate family to attend college.",
    athleticsStatus: t('profile.athleticsTooltip') !== 'profile.athleticsTooltip' ? t('profile.athleticsTooltip') : "If you're being recruited for a sport or have significant athletic achievements.",
    artsPortfolio: t('profile.artsTooltip') !== 'profile.artsTooltip' ? t('profile.artsTooltip') : "If you have significant achievements in visual arts, music, theater, or dance.",
    demonstratedInterest: t('profile.interestTooltip') !== 'profile.interestTooltip' ? t('profile.interestTooltip') : "Ways you've shown interest in specific schools (campus visits, interviews).",
    geographicLocation: t('profile.locationTooltip') !== 'profile.locationTooltip' ? t('profile.locationTooltip') : "Your home state/country - some schools value geographic diversity.",
    essayStrength: t('profile.essayTooltip') !== 'profile.essayTooltip' ? t('profile.essayTooltip') : "Self-assessment of your personal statement and supplemental essays.",
    recommendationStrength: t('profile.recsTooltip') !== 'profile.recsTooltip' ? t('profile.recsTooltip') : "Expected strength of your recommendation letters."
  };

  const DEFAULTS: ProfileData = {
    name: "", email: "", gpa: "", testScores: "", extracurriculars: "",
    courseRigor: "", apIbCourses: "", legacyStatus: "", firstGenStatus: "",
    athleticsStatus: "", artsPortfolio: "", demonstratedInterest: "",
    geographicLocation: "", essayStrength: "", recommendationStrength: "",
    personalContext: defaultPersonalContext, preferredCountries: [], cv: null,
    aLevelGrades: "", predictedGrades: "", gaokaoScore: "", nationalExamType: "",
    nationalExamScore: "", baccalaureateScore: "", researchExperience: "",
    volunteerHours: "", workExperience: "", intendedMajor: "",
  };
  // Merge initialData over defaults so any missing field (e.g. personalContext
  // from a legacy DB row) cannot crash the PersonalContext sub-component.
  const [profile, setProfile] = useState<ProfileData>({
    ...DEFAULTS,
    ...(initialData ?? {}),
    personalContext: { ...defaultPersonalContext, ...(initialData?.personalContext ?? {}) },
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Inline validation
  const emailValid = !profile.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
  const gpaNum = parseFloat(profile.gpa);
  const gpaValid = !profile.gpa || (!isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 5);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("File too large. Max size is 20MB.");
      e.target.value = "";
      return;
    }
    setProfile({ ...profile, cv: file });
    // reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !gpaValid) {
      const target = !emailValid ? "email" : "gpa";
      document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(target)?.focus();
      return;
    }
    onSubmit(profile);
  };

  const isFieldComplete = (field: keyof ProfileData) => {
    const value = profile[field];
    if (field === 'cv') return value !== null;
    if (field === 'personalContext') {
      const ctx = value as PersonalContextData | undefined;
      return !!ctx?.personalStatement?.trim();
    }
    if (field === 'preferredCountries') {
      return Array.isArray(value) && value.length > 0;
    }
    return typeof value === 'string' && value.trim() !== '';
  };

  // Detect relevant country-specific sections based on preferred countries
  const showUKFields = profile.preferredCountries.some(c => ['United Kingdom'].includes(c));
  const showAsiaFields = profile.preferredCountries.some(c => ['China', 'Japan', 'South Korea', 'Singapore', 'Hong Kong'].includes(c));
  const showEuropeFields = profile.preferredCountries.some(c => ['Germany', 'France', 'Switzerland', 'Netherlands', 'Italy', 'Spain', 'Sweden', 'Denmark', 'Belgium', 'Austria'].includes(c));

  const requiredFields: (keyof ProfileData)[] = ['name', 'email', 'gpa', 'extracurriculars'];

  // Base optional fields that apply to everyone (region-agnostic).
  const baseOptionalFields: (keyof ProfileData)[] = [
    'testScores', 'courseRigor', 'apIbCourses', 'legacyStatus', 'firstGenStatus',
    'athleticsStatus', 'artsPortfolio', 'demonstratedInterest', 'geographicLocation',
    'essayStrength', 'recommendationStrength', 'personalContext', 'cv',
    'researchExperience', 'volunteerHours', 'workExperience', 'intendedMajor',
    'preferredCountries',
  ];

  // Region-specific fields only count toward completeness when that region is targeted.
  const regionOptionalFields: (keyof ProfileData)[] = [
    ...(showUKFields ? (['aLevelGrades', 'predictedGrades'] as (keyof ProfileData)[]) : []),
    ...(showAsiaFields ? (['gaokaoScore', 'nationalExamType'] as (keyof ProfileData)[]) : []),
    ...(showEuropeFields ? (['baccalaureateScore', 'nationalExamScore'] as (keyof ProfileData)[]) : []),
  ];

  const optionalFields: (keyof ProfileData)[] = [...baseOptionalFields, ...regionOptionalFields];

  const completedRequired = requiredFields.filter(f => isFieldComplete(f)).length;
  const completedOptional = optionalFields.filter(f => isFieldComplete(f)).length;
  const totalOptional = optionalFields.length;
  const totalFields = requiredFields.length + totalOptional;
  const completedFields = completedRequired + completedOptional;
  const completenessPct = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  const isFullyComplete = completedFields === totalFields;


  return (
    <TooltipProvider>
      <div className="animate-fade-in-up">
        <Card className="max-w-3xl mx-auto shadow-card border-border/50 overflow-hidden">
          <CardHeader className="bg-gradient-primary text-primary-foreground p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">{t('profile.title')}</h2>
                <p className="text-primary-foreground/80 text-sm sm:text-base">{t('profile.subtitle')}</p>
              </div>
              <div className="flex flex-col gap-1 text-sm w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5">
                  <span className="font-medium">{t('profile.required')}: {completedRequired}/{requiredFields.length}</span>
                </div>
                <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5">
                  <span className="font-medium">{t('profile.optional')}: {completedOptional}/{totalOptional}</span>
                </div>
                {isFullyComplete && (
                  <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-50 rounded-full px-4 py-1.5 border border-emerald-300/30">
                    <span className="font-semibold">✓ 100% Complete</span>
                  </div>
                )}
              </div>
            </div>
            {/* Live progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-primary-foreground/70 mb-1.5">
                <span>Profile completeness</span>
                <span className="font-mono">{completenessPct}%{isFullyComplete ? ' · Done' : ''}</span>
              </div>
              <div className="h-1.5 rounded-full bg-primary-foreground/15 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent via-primary-foreground to-accent transition-all duration-500"
                  style={{ width: `${completenessPct}%` }}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Required Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                  {t('profile.requiredInfo')}
                </h3>
                
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="name" icon={<User className="w-4 h-4 text-primary" />} label={t('profile.name')} tooltip={t('profile.nameTooltip') !== 'profile.nameTooltip' ? t('profile.nameTooltip') : "Your legal name as it appears on official documents."} isComplete={isFieldComplete('name')} />
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      placeholder={t('profile.namePlaceholder')}
                      className={`transition-all duration-200 ${focusedField === 'name' ? 'ring-2 ring-primary/20' : ''}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="email" icon={<Mail className="w-4 h-4 text-primary" />} label="Email" tooltip={t('profile.emailTooltip') !== 'profile.emailTooltip' ? t('profile.emailTooltip') : "Your primary email for receiving updates."} isComplete={isFieldComplete('email') && emailValid} />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      aria-invalid={!emailValid}
                      placeholder="your.email@example.com"
                      className={`transition-all duration-200 ${!emailValid ? 'border-destructive ring-2 ring-destructive/20' : focusedField === 'email' ? 'ring-2 ring-primary/20' : ''}`}
                    />
                    {!emailValid && <p className="text-xs text-destructive mt-1">Please enter a valid email address.</p>}
                  </div>
                </div>

                {/* GPA Field */}
                <div className="space-y-2">
                  <FieldLabel htmlFor="gpa" icon={<BookOpen className="w-4 h-4 text-primary" />} label={`${t('profile.gpa')} *`} tooltip={FACTOR_TOOLTIPS.gpa} isComplete={isFieldComplete('gpa') && gpaValid} />
                  <Input
                    id="gpa"
                    value={profile.gpa}
                    onChange={(e) => setProfile({ ...profile, gpa: e.target.value })}
                    onFocus={() => setFocusedField('gpa')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t('profile.gpaPlaceholder')}
                    required
                    inputMode="decimal"
                    aria-invalid={!gpaValid}
                    className={`transition-all duration-200 ${!gpaValid ? 'border-destructive ring-2 ring-destructive/20' : focusedField === 'gpa' ? 'ring-2 ring-primary/20' : ''}`}
                  />
                  {!gpaValid && <p className="text-xs text-destructive mt-1">GPA must be a number between 0 and 5 (e.g. 3.85).</p>}
                </div>

                {/* Activities — chip-based builder */}
                <div className="space-y-2">
                  <FieldLabel htmlFor="extracurriculars" icon={<Award className="w-4 h-4 text-primary" />} label={`${t('profile.extracurriculars')} *`} tooltip={FACTOR_TOOLTIPS.extracurriculars} isComplete={isFieldComplete('extracurriculars')} />
                  <ActivityList
                    value={profile.extracurriculars}
                    onChange={(v) => setProfile({ ...profile, extracurriculars: v })}
                  />
                </div>
              </div>

              {/* Academic Factors */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs">2</span>
                  {t('profile.academicFactors')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="testScores" icon={<Award className="w-4 h-4 text-primary" />} label={t('profile.testScores')} tooltip={FACTOR_TOOLTIPS.testScores} isComplete={isFieldComplete('testScores')} />
                    <Input
                      id="testScores"
                      value={profile.testScores}
                      onChange={(e) => setProfile({ ...profile, testScores: e.target.value })}
                      placeholder={t('profile.testScoresPlaceholder')}
                      className="transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="courseRigor" icon={<BookOpen className="w-4 h-4 text-primary" />} label={t('profile.courseRigor')} tooltip={FACTOR_TOOLTIPS.courseRigor} isComplete={isFieldComplete('courseRigor')} />
                    <Select value={profile.courseRigor} onValueChange={(value) => setProfile({ ...profile, courseRigor: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectCurriculum')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ib-diploma">{t('profile.ibDiploma')}</SelectItem>
                        <SelectItem value="ap-heavy">{t('profile.apHeavy')}</SelectItem>
                        <SelectItem value="ap-moderate">{t('profile.apModerate')}</SelectItem>
                        <SelectItem value="ap-some">{t('profile.apSome')}</SelectItem>
                        <SelectItem value="honors">{t('profile.honors')}</SelectItem>
                        <SelectItem value="standard">{t('profile.standard')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <FieldLabel htmlFor="apIbCourses" icon={<BookOpen className="w-4 h-4 text-primary" />} label={t('profile.apIbDetails')} tooltip={FACTOR_TOOLTIPS.apIbCourses} isComplete={isFieldComplete('apIbCourses')} />
                    <ApCourseSelector
                      value={profile.apIbCourses}
                      onChange={(v) => setProfile({ ...profile, apIbCourses: v })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <FieldLabel htmlFor="geographicLocation" icon={<MapPin className="w-4 h-4 text-primary" />} label={t('profile.location')} tooltip={FACTOR_TOOLTIPS.geographicLocation} isComplete={isFieldComplete('geographicLocation')} />
                    <LocationSelector
                      id="geographicLocation"
                      value={profile.geographicLocation}
                      onChange={(v) => setProfile({ ...profile, geographicLocation: v })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <FieldLabel htmlFor="intendedMajor" icon={<GraduationCap className="w-4 h-4 text-primary" />} label="Intended Major" tooltip="The field of study you want to pursue (e.g. Computer Science, Biology, Economics). Used to match you with the right programs." isComplete={isFieldComplete('intendedMajor')} />
                    <Input
                      id="intendedMajor"
                      value={profile.intendedMajor}
                      onChange={(e) => setProfile({ ...profile, intendedMajor: e.target.value })}
                      placeholder="e.g. Computer Science, Economics, Biology"
                      className="transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Factors */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-xs">3</span>
                  {t('profile.personalFactors')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="legacyStatus" icon={<Users className="w-4 h-4 text-primary" />} label={t('profile.legacy')} tooltip={FACTOR_TOOLTIPS.legacyStatus} isComplete={isFieldComplete('legacyStatus')} />
                    <Select value={profile.legacyStatus} onValueChange={(value) => setProfile({ ...profile, legacyStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectLegacy')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent-donor">{t('profile.legacyParentDonor')}</SelectItem>
                        <SelectItem value="parent">{t('profile.legacyParent')}</SelectItem>
                        <SelectItem value="sibling">{t('profile.legacySibling')}</SelectItem>
                        <SelectItem value="extended">{t('profile.legacyExtended')}</SelectItem>
                        <SelectItem value="none">{t('profile.legacyNone')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="firstGenStatus" icon={<Heart className="w-4 h-4 text-primary" />} label={t('profile.firstGen')} tooltip={FACTOR_TOOLTIPS.firstGenStatus} isComplete={isFieldComplete('firstGenStatus')} />
                    <Select value={profile.firstGenStatus} onValueChange={(value) => setProfile({ ...profile, firstGenStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectFirstGen')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-gen">{t('profile.firstGenYes')}</SelectItem>
                        <SelectItem value="some-college">{t('profile.firstGenSome')}</SelectItem>
                        <SelectItem value="not-first-gen">{t('profile.firstGenNo')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Special Talents */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-xs">4</span>
                  {t('profile.talents')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="athleticsStatus" icon={<Trophy className="w-4 h-4 text-primary" />} label={t('profile.athletics')} tooltip={FACTOR_TOOLTIPS.athleticsStatus} isComplete={isFieldComplete('athleticsStatus')} />
                    <Select value={profile.athleticsStatus} onValueChange={(value) => setProfile({ ...profile, athleticsStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectAthletics')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="d1-recruited-revenue">{t('profile.athleticsD1Revenue')}</SelectItem>
                        <SelectItem value="d1-recruited-olympic">{t('profile.athleticsD1Olympic')}</SelectItem>
                        <SelectItem value="d3-naia">{t('profile.athleticsD3')}</SelectItem>
                        <SelectItem value="varsity-captain">{t('profile.athleticsVarsityCaptain')}</SelectItem>
                        <SelectItem value="varsity">{t('profile.athleticsVarsity')}</SelectItem>
                        <SelectItem value="club">{t('profile.athleticsClub')}</SelectItem>
                        <SelectItem value="none">{t('profile.athleticsNone')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="artsPortfolio" icon={<Palette className="w-4 h-4 text-primary" />} label={t('profile.arts')} tooltip={FACTOR_TOOLTIPS.artsPortfolio} isComplete={isFieldComplete('artsPortfolio')} />
                    <Select value={profile.artsPortfolio} onValueChange={(value) => setProfile({ ...profile, artsPortfolio: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectArts')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="national-international">{t('profile.artsNational')}</SelectItem>
                        <SelectItem value="regional">{t('profile.artsRegional')}</SelectItem>
                        <SelectItem value="local">{t('profile.artsLocal')}</SelectItem>
                        <SelectItem value="developing">{t('profile.artsDeveloping')}</SelectItem>
                        <SelectItem value="none">{t('profile.artsNone')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Background Experience */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">5</span>
                  Background Experience
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="researchExperience" icon={<FileText className="w-4 h-4 text-primary" />} label="Research Experience" tooltip="Lab work, published papers, independent research projects, or science fair achievements." isComplete={isFieldComplete('researchExperience')} />
                    <Textarea
                      id="researchExperience"
                      value={profile.researchExperience}
                      onChange={(e) => setProfile({ ...profile, researchExperience: e.target.value })}
                      placeholder="e.g. 2 years lab assistant at university bio lab; co-authored 1 paper..."
                      rows={3}
                      className="transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="volunteerHours" icon={<Heart className="w-4 h-4 text-primary" />} label="Volunteer Experience" tooltip="Community service hours, ongoing volunteer roles, or social impact work." isComplete={isFieldComplete('volunteerHours')} />
                    <Textarea
                      id="volunteerHours"
                      value={profile.volunteerHours}
                      onChange={(e) => setProfile({ ...profile, volunteerHours: e.target.value })}
                      placeholder="e.g. 200+ hours at local hospital; weekly tutor for underserved students..."
                      rows={3}
                      className="transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="workExperience" icon={<Trophy className="w-4 h-4 text-primary" />} label="Work Experience" tooltip="Internships, part-time jobs, entrepreneurship, or paid professional roles." isComplete={isFieldComplete('workExperience')} />
                    <Textarea
                      id="workExperience"
                      value={profile.workExperience}
                      onChange={(e) => setProfile({ ...profile, workExperience: e.target.value })}
                      placeholder="e.g. Summer internship at tech startup; part-time barista 1 year..."
                      rows={3}
                      className="transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Application Strength */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs">6</span>
                  {t('profile.appStrength')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <FieldLabel htmlFor="essayStrength" icon={<FileText className="w-4 h-4 text-primary" />} label={t('profile.essayStrength')} tooltip={FACTOR_TOOLTIPS.essayStrength} isComplete={isFieldComplete('essayStrength')} />
                    <Select value={profile.essayStrength} onValueChange={(value) => setProfile({ ...profile, essayStrength: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectEssay')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exceptional">{t('profile.essayExceptional')}</SelectItem>
                        <SelectItem value="strong">{t('profile.essayStrong')}</SelectItem>
                        <SelectItem value="good">{t('profile.essayGood')}</SelectItem>
                        <SelectItem value="average">{t('profile.essayAverage')}</SelectItem>
                        <SelectItem value="weak">{t('profile.essayWeak')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="recommendationStrength" icon={<Users className="w-4 h-4 text-primary" />} label={t('profile.recommendations')} tooltip={FACTOR_TOOLTIPS.recommendationStrength} isComplete={isFieldComplete('recommendationStrength')} />
                    <Select value={profile.recommendationStrength} onValueChange={(value) => setProfile({ ...profile, recommendationStrength: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectRecs')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exceptional">{t('profile.recsExceptional')}</SelectItem>
                        <SelectItem value="very-strong">{t('profile.recsVeryStrong')}</SelectItem>
                        <SelectItem value="good">{t('profile.recsGood')}</SelectItem>
                        <SelectItem value="average">{t('profile.recsAverage')}</SelectItem>
                        <SelectItem value="uncertain">{t('profile.recsUncertain')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel htmlFor="demonstratedInterest" icon={<GraduationCap className="w-4 h-4 text-primary" />} label={t('profile.interest')} tooltip={FACTOR_TOOLTIPS.demonstratedInterest} isComplete={isFieldComplete('demonstratedInterest')} />
                    <Select value={profile.demonstratedInterest} onValueChange={(value) => setProfile({ ...profile, demonstratedInterest: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('profile.selectInterest')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="very-high">{t('profile.interestVeryHigh')}</SelectItem>
                        <SelectItem value="high">{t('profile.interestHigh')}</SelectItem>
                        <SelectItem value="moderate">{t('profile.interestModerate')}</SelectItem>
                        <SelectItem value="basic">{t('profile.interestBasic')}</SelectItem>
                        <SelectItem value="none">{t('profile.interestNone')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Preferred Countries */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">6</span>
                  {t('profile.targetCountries')}
                </h3>
                <CountrySelector
                  value={profile.preferredCountries}
                  onChange={(countries) => setProfile({ ...profile, preferredCountries: countries })}
                />
              </div>

              {/* Country-Specific Academic Fields */}
              {(showUKFields || showAsiaFields || showEuropeFields) && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs">★</span>
                    Region-Specific Qualifications
                  </h3>
                  <p className="text-sm text-muted-foreground">These fields improve accuracy for your selected target countries.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {showUKFields && (
                      <>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="aLevelGrades" icon={<BookOpen className="w-4 h-4 text-primary" />} label="A-Level Grades" tooltip="Your A-Level grades (e.g., A*A*A, AAB). Critical for UK university admissions." isComplete={isFieldComplete('aLevelGrades')} />
                          <Input
                            id="aLevelGrades"
                            value={profile.aLevelGrades}
                            onChange={(e) => setProfile({ ...profile, aLevelGrades: e.target.value })}
                            placeholder="e.g., A*A*A in Maths, Physics, Chemistry"
                            className="transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="predictedGrades" icon={<BookOpen className="w-4 h-4 text-primary" />} label="Predicted Grades" tooltip="Your predicted grades from your school, used for UK UCAS applications." isComplete={isFieldComplete('predictedGrades')} />
                          <Input
                            id="predictedGrades"
                            value={profile.predictedGrades}
                            onChange={(e) => setProfile({ ...profile, predictedGrades: e.target.value })}
                            placeholder="e.g., Predicted A*A*A*"
                            className="transition-all duration-200"
                          />
                        </div>
                      </>
                    )}
                    
                    {showAsiaFields && (
                      <>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="gaokaoScore" icon={<BookOpen className="w-4 h-4 text-primary" />} label="Gaokao / National Exam Score" tooltip="Your Gaokao score (China) or equivalent national exam score." isComplete={isFieldComplete('gaokaoScore')} />
                          <Input
                            id="gaokaoScore"
                            value={profile.gaokaoScore}
                            onChange={(e) => setProfile({ ...profile, gaokaoScore: e.target.value })}
                            placeholder="e.g., 680/750"
                            className="transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="nationalExamType" icon={<BookOpen className="w-4 h-4 text-primary" />} label="National Exam Type" tooltip="Type of national exam taken (e.g., Gaokao, CSAT, JEE)." isComplete={isFieldComplete('nationalExamType')} />
                          <Select value={profile.nationalExamType} onValueChange={(value) => setProfile({ ...profile, nationalExamType: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select exam type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gaokao">Gaokao (China)</SelectItem>
                              <SelectItem value="csat">CSAT (South Korea)</SelectItem>
                              <SelectItem value="jee">JEE (India)</SelectItem>
                              <SelectItem value="a-levels-hk">HKDSE (Hong Kong)</SelectItem>
                              <SelectItem value="singapore-a">Singapore A-Levels</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                    
                    {showEuropeFields && (
                      <>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="baccalaureateScore" icon={<BookOpen className="w-4 h-4 text-primary" />} label="Baccalaureate / Matura Score" tooltip="Your European Baccalaureate, French Bac, German Abitur, or Matura score." isComplete={isFieldComplete('baccalaureateScore')} />
                          <Input
                            id="baccalaureateScore"
                            value={profile.baccalaureateScore}
                            onChange={(e) => setProfile({ ...profile, baccalaureateScore: e.target.value })}
                            placeholder="e.g., 42/45 IB, 18/20 French Bac, Abitur 1.2"
                            className="transition-all duration-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <FieldLabel htmlFor="nationalExamScore" icon={<BookOpen className="w-4 h-4 text-primary" />} label="National Exam Score" tooltip="Score on any additional national exams (e.g., Selectividad, TestAS)." isComplete={isFieldComplete('nationalExamScore')} />
                          <Input
                            id="nationalExamScore"
                            value={profile.nationalExamScore}
                            onChange={(e) => setProfile({ ...profile, nationalExamScore: e.target.value })}
                            placeholder="e.g., Selectividad 13.5/14"
                            className="transition-all duration-200"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Context Section */}
              <PersonalContext 
                value={profile.personalContext} 
                onChange={(ctx) => setProfile({ ...profile, personalContext: ctx })}
              />

              {/* CV Upload Field */}
              <div className="space-y-2">
                <FieldLabel htmlFor="cv" icon={<FileText className="w-4 h-4 text-primary" />} label={t('profile.uploadCV')} tooltip={t('profile.cvTooltip') !== 'profile.cvTooltip' ? t('profile.cvTooltip') : "Upload your CV (PDF or TXT). For DOCX, please export as PDF first."} isComplete={isFieldComplete('cv')} />
                <div className="mt-2">
                  <label
                    htmlFor="cv"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (!f) return;
                      if (f.size > 20 * 1024 * 1024) return;
                      setProfile({ ...profile, cv: f });
                    }}
                    className={`flex w-full h-24 cursor-pointer items-center justify-center rounded-md border-2 border-dashed bg-background transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                      profile.cv ? 'border-success bg-success/5' : 'border-input'
                    }`}
                  >
                    <input
                      id="cv"
                      type="file"
                      accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none text-center px-3">
                      <Upload className={`w-6 h-6 ${profile.cv ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className={`text-sm ${profile.cv ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                        {profile.cv ? profile.cv.name : `${t('profile.clickToUpload')} — drag & drop PDF or TXT (max 20MB)`}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-gradient-primary hover:shadow-glow text-lg py-6 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] group"
              >
                {t('profile.analyzeButton')} ({completedFields}/{totalFields})
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
