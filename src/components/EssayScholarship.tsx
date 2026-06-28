import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Award, Sparkles } from "lucide-react";

interface Scholarship {
  name: string;
  probability: number;
  details: string;
}

interface EssayScholarshipData {
  essays: string[];
  scholarships: Scholarship[];
}

export const EssayScholarship = ({ data }: { data: EssayScholarshipData | null }) => {
  if (!data) return null;

  const getProbabilityInfo = (prob: number) => {
    if (prob >= 70) return { color: "bg-success/10 text-success border-success/20", bar: "bg-success" };
    if (prob >= 40) return { color: "bg-accent/10 text-accent border-accent/20", bar: "bg-accent" };
    return { color: "bg-destructive/10 text-destructive border-destructive/20", bar: "bg-destructive" };
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Essay Topics */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Essay Topics</h2>
            <p className="text-muted-foreground">Personalized topics based on your unique story</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {data.essays.map((essay, i) => (
            <Card key={i} className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{essay}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scholarships */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Award className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Scholarships</h2>
            <p className="text-muted-foreground">Opportunities matched to your profile</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {data.scholarships.map((scholarship, i) => {
            const info = getProbabilityInfo(scholarship.probability);
            return (
              <Card key={i} className="shadow-card hover:shadow-hover transition-all duration-300 border-border/50 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <h3 className="text-lg font-display font-bold text-foreground">{scholarship.name}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{scholarship.details}</p>
                    </div>
                    <div className="md:w-40 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className={`${info.color} border`}>Match</Badge>
                        <span className="font-bold text-foreground">{scholarship.probability}%</span>
                      </div>
                      <Progress value={scholarship.probability} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
