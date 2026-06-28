import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProfile, ProfileData } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  FileDown, FileText, GraduationCap, BarChart3, Map,
  CheckCircle2, Download, Loader2, Braces
} from "lucide-react";
import { toUnifiedProfile } from "@/lib/profileSchema";

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: "profile-summary",
    title: "Profile Summary",
    description: "Complete profile with all 15 admission factors, scores, and personal details",
    icon: BarChart3,
    color: "text-primary",
  },
  {
    id: "unified-json",
    title: "Unified Profile (JSON)",
    description: "Machine-readable export of your full unified profile, activities, and achievements",
    icon: Braces,
    color: "text-accent",
  },
  {
    id: "university-report",
    title: "University Match Report",
    description: "Matched universities with admission probabilities and recommendations",
    icon: GraduationCap,
    color: "text-accent",
  },
  {
    id: "application-checklist",
    title: "Application Checklist",
    description: "Complete application timeline and checklist for all tracked programs",
    icon: CheckCircle2,
    color: "text-success",
  },
  {
    id: "roadmap",
    title: "Application Roadmap",
    description: "12-month application timeline with actionable steps and deadlines",
    icon: Map,
    color: "text-warning",
  },
];

export const PDFExport = () => {
  const { profile } = useProfile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<string | null>(null);

  const generateProfilePDF = (profile: ProfileData | null) => {
    if (!profile) return "";
    const sections = [
      `UNIVISTA.AI - STUDENT PROFILE REPORT`,
      `Generated: ${new Date().toLocaleDateString()}`,
      ``,
      `═══════════════════════════════════════`,
      `PERSONAL INFORMATION`,
      `═══════════════════════════════════════`,
      `Name: ${profile.name || "N/A"}`,
      `Email: ${profile.email || "N/A"}`,
      `Country: ${profile.preferredCountries?.join(", ") || "N/A"}`,
      ``,
      `═══════════════════════════════════════`,
      `ACADEMIC PROFILE`,
      `═══════════════════════════════════════`,
      `GPA: ${profile.gpa || "N/A"}`,
      `Test Scores: ${profile.testScores || "N/A"}`,
      `Course Rigor: ${profile.courseRigor || "N/A"}`,
      ``,
      `═══════════════════════════════════════`,
      `EXTRACURRICULAR ACTIVITIES`,
      `═══════════════════════════════════════`,
      `${profile.extracurriculars || "N/A"}`,
      ``,
      `═══════════════════════════════════════`,
      `ADDITIONAL FACTORS`,
      `═══════════════════════════════════════`,
      `Legacy Status: ${profile.legacyStatus || "N/A"}`,
      `First Generation: ${profile.firstGenStatus || "N/A"}`,
      `Athletics: ${profile.athleticsStatus || "N/A"}`,
      `Research Experience: ${(profile as any).researchExperience || "N/A"}`,
      `Work Experience: ${(profile as any).workExperience || "N/A"}`,
      `Honors & Awards: ${(profile as any).honorsAwards || "N/A"}`,
    ];
    return sections.join("\n");
  };

  const handleExport = async (optionId: string) => {
    setGenerating(optionId);

    try {
      let content = "";
      let filename = "";
      let mime = "text/plain;charset=utf-8";

      switch (optionId) {
        case "profile-summary":
          content = generateProfilePDF(profile);
          filename = `UniVista_Profile_${new Date().toISOString().split("T")[0]}.txt`;
          break;
        case "unified-json": {
          const unified = toUnifiedProfile(profile);
          const payload = {
            exportedAt: new Date().toISOString(),
            user: { name: profile?.name || null, email: profile?.email || user?.email || null },
            unified,
            raw: profile,
          };
          content = JSON.stringify(payload, null, 2);
          filename = `UniVista_UnifiedProfile_${new Date().toISOString().split("T")[0]}.json`;
          mime = "application/json;charset=utf-8";
          break;
        }
        case "university-report":
          content = [
            "UNIVISTA.AI - UNIVERSITY MATCH REPORT",
            `Generated: ${new Date().toLocaleDateString()}`,
            "",
            "Note: Visit your dashboard to see full AI-powered university matches",
            "with detailed admission probabilities and factor breakdowns.",
            "",
            `Student: ${profile?.name || "N/A"}`,
            `GPA: ${profile?.gpa || "N/A"}`,
            `Target Countries: ${profile?.preferredCountries?.join(", ") || "N/A"}`,
          ].join("\n");
          filename = `UniVista_UniMatch_${new Date().toISOString().split("T")[0]}.txt`;
          break;
        case "application-checklist":
          content = [
            "UNIVISTA.AI - APPLICATION CHECKLIST",
            `Generated: ${new Date().toLocaleDateString()}`,
            "",
            "Track your applications in the Program Tracker and Application Progress modules.",
            "This export provides a snapshot of your current application status.",
          ].join("\n");
          filename = `UniVista_Checklist_${new Date().toISOString().split("T")[0]}.txt`;
          break;
        case "roadmap":
          content = [
            "UNIVISTA.AI - APPLICATION ROADMAP",
            `Generated: ${new Date().toLocaleDateString()}`,
            "",
            "Your personalized 12-month application roadmap is available in the Roadmap section.",
            "Complete your profile to generate an AI-powered timeline.",
          ].join("\n");
          filename = `UniVista_Roadmap_${new Date().toISOString().split("T")[0]}.txt`;
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (err) {
      toast({
        title: "Export Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <FileDown className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Export Reports</h2>
              <p className="text-primary-foreground/80">Download your application data and AI analysis reports</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            {EXPORT_OPTIONS.map(option => (
              <Card
                key={option.id}
                className="p-5 border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => handleExport(option.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <option.icon className={`w-6 h-6 ${option.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Download ${option.title}`}
                    disabled={generating === option.id}
                    className="flex-shrink-0"
                  >
                    {generating === option.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Complete your profile and run AI analysis first for the most comprehensive reports.
              Export data is generated from your current profile and analysis results.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
