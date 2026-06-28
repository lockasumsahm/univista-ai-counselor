import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MentorCard } from "./MentorCard";
import { MENTORS } from "./data";

const EXPERTISE_FILTERS = [
  "All", "STEM", "Business", "Medicine", "UK Universities",
  "European Universities", "Scholarships", "Essays", "Engineering",
  "Computer Science", "Research Experience", "Financial Aid",
  "Pre-Med", "Interviews", "MBA Prep", "Law School",
];

const PAGE_SIZE = 12;

export const AlumniMentors = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = MENTORS.filter((m) => {
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.expertise.some((e) => e.toLowerCase().includes(search.toLowerCase())) ||
      m.university.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === "All" ||
      m.expertise.some((e) => e.toLowerCase().includes(activeFilter.toLowerCase()));

    return matchesSearch && matchesFilter;
  });

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="space-y-5">
      {/* Honesty banner — mentor matching is in early access */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
        <p className="font-semibold text-foreground mb-1">Early access — mentor matching opens later this term</p>
        <p className="text-muted-foreground text-xs leading-relaxed">
          The mentors below are real students and alumni from the listed universities who've signed up to help.
          You can queue a request now and you'll be routed to them by email when matching goes live —
          we won't auto-confirm a reply that hasn't happened yet.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search mentors by name, expertise, or university..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
          className="pl-9"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <Filter className="w-4 h-4 text-muted-foreground mt-1.5" />
        {EXPERTISE_FILTERS.map((f) => (
          <Badge
            key={f}
            variant={activeFilter === f ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => { setActiveFilter(f); setVisibleCount(PAGE_SIZE); }}
          >
            {f}
          </Badge>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span><strong className="text-foreground">{MENTORS.length}</strong> mentors</span>
        <span><strong className="text-foreground">{MENTORS.filter(m => m.available).length}</strong> available now</span>
        <span><strong className="text-foreground">{MENTORS.reduce((s, m) => s + (m.mentees || 0), 0).toLocaleString()}+</strong> students helped</span>
        {search || activeFilter !== "All" ? (
          <span><strong className="text-foreground">{filtered.length}</strong> matching</span>
        ) : null}
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {displayed.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No mentors match your search. Try different keywords.
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setVisibleCount(prev => prev + PAGE_SIZE)}
        >
          <ChevronDown className="w-4 h-4" />
          Show More ({filtered.length - visibleCount} remaining)
        </Button>
      )}

      {/* Become a mentor CTA */}
      <Card className="p-6 bg-gradient-to-r from-accent/5 to-primary/5 border-accent/20">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Heart className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-semibold">Become a Mentor</h3>
            <p className="text-sm text-muted-foreground">
              Are you a university student or alum? Help the next generation achieve their dreams.
            </p>
          </div>
          <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
            Apply Now
          </Button>
        </div>
      </Card>
    </div>
  );
};
