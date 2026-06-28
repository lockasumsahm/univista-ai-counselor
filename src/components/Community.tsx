import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, MessageCircle, Sparkles, GraduationCap } from "lucide-react";
import { SuccessStories } from "./community/SuccessStories";
import { AlumniMentors } from "./community/AlumniMentors";
import { ForumTab } from "./community/ForumTab";

export const Community = () => {
  const [activeTab, setActiveTab] = useState("stories");

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-card border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-primary text-primary-foreground p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Community & Mentorship</h2>
              <p className="text-primary-foreground/80">Learn from students who made it and connect with alumni</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Success Stories
              </TabsTrigger>
              <TabsTrigger value="mentors" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Alumni Mentors
              </TabsTrigger>
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Forum
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stories">
              <SuccessStories />
            </TabsContent>
            <TabsContent value="mentors">
              <AlumniMentors />
            </TabsContent>
            <TabsContent value="forum">
              <ForumTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
