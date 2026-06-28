import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart3, Target } from "lucide-react";

export interface FactorScore {
  factor: string;
  score: number;
  weight: number;
  contribution: number;
  status: "strength" | "neutral" | "weakness";
}

interface ScoreBreakdownProps {
  overallScore: number;
  factors: FactorScore[];
  universityName?: string;
  category?: "Safe" | "Match" | "Reach" | "Hard Reach";
}

const FACTOR_COLORS = {
  strength: "hsl(142, 76%, 36%)", // success
  neutral: "hsl(36, 85%, 50%)", // accent
  weakness: "hsl(0, 84%, 60%)", // destructive
};

const STATUS_ICONS = {
  strength: <TrendingUp className="w-4 h-4 text-success" />,
  neutral: <Minus className="w-4 h-4 text-accent" />,
  weakness: <TrendingDown className="w-4 h-4 text-destructive" />,
};

export const ScoreBreakdown = ({ overallScore, factors, universityName, category }: ScoreBreakdownProps) => {
  // Sort factors by contribution for the bar chart
  const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);
  
  // Prepare data for bar chart
  const barChartData = sortedFactors.map(f => ({
    name: f.factor.length > 12 ? f.factor.substring(0, 12) + "..." : f.factor,
    fullName: f.factor,
    score: f.score,
    contribution: f.contribution,
    weight: f.weight,
    status: f.status,
  }));

  // Prepare data for radar chart (top 8 factors)
  const radarData = sortedFactors.slice(0, 8).map(f => ({
    factor: f.factor.length > 10 ? f.factor.substring(0, 10) + "..." : f.factor,
    score: f.score,
    fullMark: 100,
  }));

  // Calculate strengths and weaknesses count
  const strengths = factors.filter(f => f.status === "strength");
  const weaknesses = factors.filter(f => f.status === "weakness");

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "Safe": return "bg-success/10 text-success border-success/20";
      case "Match": return "bg-accent/10 text-accent border-accent/20";
      case "Reach": return "bg-warning/10 text-warning border-warning/20";
      case "Hard Reach": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Overall Score */}
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <BarChart3 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">
                  {universityName ? `${universityName} Analysis` : "Score Breakdown"}
                </h2>
                <p className="text-primary-foreground/80">Detailed factor-by-factor evaluation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {category && (
                <Badge className={`${getCategoryColor(category)} border text-sm px-4 py-1`}>
                  {category}
                </Badge>
              )}
              <div className="text-right">
                <div className="text-4xl font-display font-bold">{overallScore}%</div>
                <div className="text-sm text-primary-foreground/80">Match Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-success/5 rounded-xl border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Strengths</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{strengths.length}</div>
            </div>
            <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Factors Analyzed</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{factors.length}</div>
            </div>
            <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Areas to Improve</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{weaknesses.length}</div>
            </div>
          </div>

          {/* Bar Chart - Factor Contributions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Factor Contribution to Score</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-semibold text-foreground">{data.fullName}</p>
                            <p className="text-sm text-muted-foreground">Score: {data.score}/100</p>
                            <p className="text-sm text-muted-foreground">Weight: {data.weight}%</p>
                            <p className="text-sm text-accent font-medium">Contribution: {data.contribution.toFixed(1)} pts</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FACTOR_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Profile Radar</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Factor List */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Factor Scores</h3>
            <div className="space-y-3">
              {sortedFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    {STATUS_ICONS[factor.status]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground truncate">{factor.factor}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Weight: {factor.weight}%</span>
                        <span className="font-bold text-foreground">{factor.score}/100</span>
                      </div>
                    </div>
                    <Progress value={factor.score} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to generate factor breakdown from profile data using official weights
export const generateFactorBreakdown = (profile: any, matchPercentage: number): { overallScore: number; factors: FactorScore[] } => {
  const factors: FactorScore[] = [];
  
  // 1. Academic Performance (22%)
  const gpaValue = parseFloat(profile.gpa) || 0;
  let gpaScore = 50;
  if (gpaValue >= 4.0) gpaScore = 97;
  else if (gpaValue >= 3.8) gpaScore = 89;
  else if (gpaValue >= 3.6) gpaScore = 79;
  else if (gpaValue >= 3.4) gpaScore = 69;
  else if (gpaValue >= 3.0) gpaScore = 57;
  else gpaScore = 40;
  
  factors.push({
    factor: "Academic Performance",
    score: gpaScore,
    weight: 22,
    contribution: (gpaScore * 0.22),
    status: gpaScore >= 85 ? "strength" : gpaScore >= 65 ? "neutral" : "weakness"
  });

  // 2. Course Rigor (13%)
  const courseRigorMap: Record<string, number> = {
    "ib-diploma": 97, "ap-heavy": 89, "ap-moderate": 77, "ap-some": 62, "honors": 47, "standard": 32
  };
  const courseRigorScore = courseRigorMap[profile.courseRigor] || 50;
  factors.push({
    factor: "Course Rigor",
    score: courseRigorScore,
    weight: 13,
    contribution: (courseRigorScore * 0.13),
    status: courseRigorScore >= 80 ? "strength" : courseRigorScore >= 55 ? "neutral" : "weakness"
  });

  // 3. Standardized Tests (5%)
  const testScoreRaw = profile.testScores?.match(/\d{3,4}/)?.[0];
  let testScore = 50;
  if (testScoreRaw) {
    const sat = parseInt(testScoreRaw);
    if (sat >= 1550) testScore = 97;
    else if (sat >= 1500) testScore = 89;
    else if (sat >= 1450) testScore = 79;
    else if (sat >= 1400) testScore = 69;
    else if (sat >= 1300) testScore = 57;
    else testScore = 45;
  }
  factors.push({
    factor: "Standardized Tests",
    score: testScore,
    weight: 5,
    contribution: (testScore * 0.05),
    status: testScore >= 85 ? "strength" : testScore >= 65 ? "neutral" : "weakness"
  });

  // 4. Extracurricular Activities & Achievements (15%)
  const ecText = profile.extracurriculars?.toLowerCase() || "";
  let ecScore = 55;
  if (ecText.includes("international") || ecText.includes("isef") || ecText.includes("imo") || ecText.includes("olympiad")) ecScore = 97;
  else if (ecText.includes("national") || ecText.includes("usamo") || ecText.includes("champion")) ecScore = 89;
  else if (ecText.includes("state") || ecText.includes("regional")) ecScore = 77;
  else if (ecText.includes("president") || ecText.includes("founder") || ecText.includes("leader")) ecScore = 62;
  else if (ecText.length > 100) ecScore = 47;
  else ecScore = 32;
  
  factors.push({
    factor: "Extracurriculars & Achievements",
    score: ecScore,
    weight: 15,
    contribution: (ecScore * 0.15),
    status: ecScore >= 80 ? "strength" : ecScore >= 55 ? "neutral" : "weakness"
  });

  // 5. Leadership & Initiative (8%)
  let leadershipScore = 45;
  if (ecText.includes("founded") || ecText.includes("ceo") || ecText.includes("started")) leadershipScore = 95;
  else if (ecText.includes("president") || ecText.includes("captain")) leadershipScore = 87;
  else if (ecText.includes("officer") || ecText.includes("vice")) leadershipScore = 72;
  else if (ecText.includes("leader") || ecText.includes("head")) leadershipScore = 57;
  else if (ecText.includes("member")) leadershipScore = 42;
  
  factors.push({
    factor: "Leadership & Initiative",
    score: leadershipScore,
    weight: 8,
    contribution: (leadershipScore * 0.08),
    status: leadershipScore >= 80 ? "strength" : leadershipScore >= 55 ? "neutral" : "weakness"
  });

  // 6. Athletics / Arts / Special Talent (6%)
  const athleticsMap: Record<string, number> = {
    "d1-recruited-revenue": 97, "d1-recruited-olympic": 89, "d3-naia": 77, "varsity-captain": 62, "varsity": 47, "club": 32, "none": 0
  };
  const artsMap: Record<string, number> = {
    "national-international": 97, "regional": 85, "local": 70, "developing": 52, "none": 0
  };
  const athleticsScore = athleticsMap[profile.athleticsStatus] || 0;
  const artsScore = artsMap[profile.artsPortfolio] || 0;
  const talentScore = Math.max(athleticsScore, artsScore);
  
  if (talentScore > 0) {
    factors.push({
      factor: "Athletics / Arts / Talent",
      score: talentScore,
      weight: 6,
      contribution: (talentScore * 0.06),
      status: talentScore >= 80 ? "strength" : talentScore >= 55 ? "neutral" : "weakness"
    });
  }

  // 7. Essays & Personal Statements (14%)
  const essayMap: Record<string, number> = {
    "exceptional": 95, "strong": 82, "good": 67, "average": 52, "weak": 35
  };
  const essayScore = essayMap[profile.essayStrength] || 60;
  factors.push({
    factor: "Essays & Personal Statements",
    score: essayScore,
    weight: 14,
    contribution: (essayScore * 0.14),
    status: essayScore >= 80 ? "strength" : essayScore >= 60 ? "neutral" : "weakness"
  });

  // 8. Letters of Recommendation (5%)
  const recMap: Record<string, number> = {
    "exceptional": 95, "very-strong": 82, "good": 67, "average": 52, "uncertain": 45
  };
  const recScore = recMap[profile.recommendationStrength] || 60;
  factors.push({
    factor: "Recommendations",
    score: recScore,
    weight: 5,
    contribution: (recScore * 0.05),
    status: recScore >= 80 ? "strength" : recScore >= 60 ? "neutral" : "weakness"
  });

  // 9. Personal Context & Hardships (7%) - Multiplier effect
  let contextScore = 50;
  const ctx = profile.personalContext;
  if (ctx) {
    const hasHardship = ctx.hasFinancialHardship || ctx.hasFamilyResponsibilities || 
                        ctx.hasHealthChallenges || ctx.hasImmigrationContext || ctx.hasWorkExperience;
    if (hasHardship && ctx.additionalContext?.length > 50) {
      contextScore = 90; // Strong context with explanation
    } else if (hasHardship) {
      contextScore = 75; // Has hardship, limited context
    }
  }
  factors.push({
    factor: "Personal Context",
    score: contextScore,
    weight: 7,
    contribution: (contextScore * 0.07),
    status: contextScore >= 75 ? "strength" : "neutral"
  });

  // 10. Background Factors (3%)
  const firstGenMap: Record<string, number> = {
    "first-gen": 85, "some-college": 65, "not-first-gen": 50
  };
  const backgroundScore = firstGenMap[profile.firstGenStatus] || 50;
  factors.push({
    factor: "Background Factors",
    score: backgroundScore,
    weight: 3,
    contribution: (backgroundScore * 0.03),
    status: backgroundScore >= 75 ? "strength" : "neutral"
  });

  // 11. Demonstrated Interest (2%)
  const interestMap: Record<string, number> = {
    "very-high": 95, "high": 82, "moderate": 67, "basic": 52, "none": 37
  };
  const interestScore = interestMap[profile.demonstratedInterest] || 50;
  factors.push({
    factor: "Demonstrated Interest",
    score: interestScore,
    weight: 2,
    contribution: (interestScore * 0.02),
    status: interestScore >= 80 ? "strength" : interestScore >= 55 ? "neutral" : "weakness"
  });

  return {
    overallScore: matchPercentage,
    factors
  };
};
