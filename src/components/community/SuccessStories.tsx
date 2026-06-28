import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap, Globe, Star, ArrowRight, Quote } from "lucide-react";
import { SUCCESS_STORIES } from "./data";

export const SuccessStories = () => (
  <div className="space-y-6">
    {SUCCESS_STORIES.map((story) => (
      <Card key={story.id} className="p-6 hover:shadow-hover transition-all">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-accent">
            <AvatarFallback className="bg-accent/10 text-accent font-bold text-lg">
              {story.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-semibold text-lg">{story.name}</h3>
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                {story.country}
              </Badge>
              <Badge className="bg-success/10 text-success text-xs">
                Class of {story.yearAdmitted}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {story.acceptedTo.map(uni => (
                <Badge key={uni} className="bg-primary/10 text-primary">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {uni}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              <span className="font-medium text-foreground">Major:</span> {story.major}
              {Object.entries(story.stats).map(([key, val]) => (
                <span key={key}>
                  {' | '}<span className="font-medium text-foreground ml-1">{key.toUpperCase()}:</span> {val}
                </span>
              ))}
            </p>

            <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground mb-4">
              <Quote className="w-4 h-4 inline mr-2 text-accent" />
              {story.story}
            </blockquote>

            <div className="bg-muted/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                Top Tips from {story.name.split(' ')[0]}
              </h4>
              <ul className="space-y-1">
                {story.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <ArrowRight className="w-3 h-3 mt-1 text-accent flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);
