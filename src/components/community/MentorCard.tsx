import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Star, Users, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Mentor } from "./data";

export const MentorCard = ({ mentor }: { mentor: Mentor }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const initials = mentor.name.split(" ").map((n) => n[0]).join("");

  const handleSend = () => {
    if (!message.trim()) {
      toast({ title: "Add a message", description: "Tell the mentor what you'd like help with.", variant: "destructive" });
      return;
    }
    setSent(true);
    toast({
      title: "Request queued",
      description: `We'll forward this to ${mentor.name.split(" ")[0]} once mentor matching opens. You'll get an email when they respond.`,
    });
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setTopic("");
      setMessage("");
    }, 2200);
  };

  return (
    <>
      <Card className="group relative overflow-hidden hover:shadow-hover transition-all duration-300">
        <div className="h-1 bg-gradient-primary" />

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-14 h-14 border-2 border-primary ring-2 ring-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
              {mentor.available && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-semibold truncate">{mentor.name}</h3>
                <Badge
                  variant={mentor.available ? "default" : "outline"}
                  className={mentor.available ? "bg-success/10 text-success border-success/20 text-xs" : "text-xs"}
                >
                  {mentor.available ? "Available" : "Unavailable"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground truncate">
                {mentor.university} '{mentor.graduatedYear.toString().slice(-2)}
              </p>
              <p className="text-sm text-primary font-medium mt-0.5 truncate">{mentor.currentRole}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {mentor.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {mentor.rating}
              </span>
            )}
            {mentor.mentees && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {mentor.mentees} mentees
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {mentor.expertise.map((exp) => (
              <Badge key={exp} variant="outline" className="text-xs bg-muted/50">
                {exp}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{mentor.bio}</p>

          <Button
            size="sm"
            disabled={!mentor.available}
            className="w-full mt-4"
            aria-label={`Request mentorship from ${mentor.name}`}
            onClick={() => setOpen(true)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {mentor.available ? "Request Mentorship" : "Currently Unavailable"}
          </Button>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-12 h-12 border-2 border-primary">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-base">Request mentorship from {mentor.name}</DialogTitle>
                <DialogDescription className="text-xs">
                  {mentor.currentRole} · {mentor.university}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {sent ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <p className="font-semibold">Request queued</p>
              <p className="text-sm text-muted-foreground">
                We'll forward your message to {mentor.name.split(" ")[0]} once mentor matching is live.
                You'll get an email at the address on your account when they reply.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
                <strong className="text-warning">Early access:</strong> mentor matching opens later this term.
                Submit your request now and you'll be in the first batch routed to {mentor.name.split(" ")[0]}.
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Topic (optional)</label>
                <Input
                  placeholder="e.g. Personal statement review, Stanford CS application…"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Your message</label>
                <Textarea
                  placeholder="Introduce yourself and share what you'd like guidance on…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {mentor.expertise.slice(0, 3).map((e) => (
                  <Badge key={e} variant="outline" className="text-xs bg-muted/50">{e}</Badge>
                ))}
              </div>
              <Button className="w-full gap-2" onClick={handleSend}>
                <Send className="w-4 h-4" /> Queue request
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Your message stays private until mentor matching is enabled.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
