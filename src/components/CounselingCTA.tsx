import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Users, Sparkles, CheckCircle2, Loader2, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl, type BookingEvent } from "@/lib/calendar";
import { trackEvent } from "@/lib/analytics";


const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
];

const TOPICS = [
  "University shortlist review",
  "Essay feedback",
  "Application strategy (ED/EA/RD)",
  "Major / career direction",
  "Scholarships & financial aid",
  "Visa & post-admit planning",
  "Other",
];

const todayISO = () => new Date().toISOString().slice(0, 10);
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const CounselingCTA = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    preferred_date: todayISO(),
    preferred_time: "10:00",
    topic: TOPICS[0],
    question: "",
  });

  const openDialog = () => {
    setForm((f) => ({
      ...f,
      name: f.name || profile?.name || "",
      email: f.email || profile?.email || user?.email || "",
    }));
    setDone(false);
    setOpen(true);
  };

  const submit = async () => {
    if (!user) {
      toast.error("Please sign in to book a session");
      return;
    }
    if (form.question.trim().length < 5) {
      toast.error("Please describe what you need help with (at least 5 characters)");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("book-counseling", {
        body: { ...form, timezone: tz },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Could not book session");
      setDone(true);
      trackEvent("counseling_booked", { topic: form.topic, date: form.preferred_date });
      toast.success("Booking received! We'll confirm by email.");
    } catch (e: any) {
      toast.error(e.message || "Could not book session. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const bookingEvent = (): BookingEvent => ({
    title: `UniVista counseling — ${form.topic}`,
    description: `30-min 1-on-1 with UniVista counselor.\n\nTopic: ${form.topic}\nQuestion: ${form.question}`,
    startISO: `${form.preferred_date}T${form.preferred_time}:00`,
    durationMinutes: 30,
    location: "Online (link in confirmation email)",
  });


  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-success/5">
      <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Book a 1-on-1 counseling session
              <Sparkles className="w-4 h-4 text-success" />
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Pick a 30-minute slot with a human counselor. Free first session — confirmation within 24 hours.
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shrink-0" onClick={openDialog}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Pick a slot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            {done ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
                <DialogTitle>Booking received</DialogTitle>
                <DialogDescription>
                  We'll email <span className="font-medium text-foreground">{form.email}</span> to
                  confirm your <span className="font-medium text-foreground">{form.preferred_date} at {form.preferred_time}</span> slot
                  within 24 hours.
                </DialogDescription>
                <div className="pt-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Add to your calendar:</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={() => downloadIcs(bookingEvent())}>
                      <Download className="w-4 h-4 mr-2" /> .ics file
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={googleCalendarUrl(bookingEvent())} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Google Calendar
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={outlookCalendarUrl(bookingEvent())} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> Outlook
                      </a>
                    </Button>
                  </div>
                </div>
                <Button onClick={() => setOpen(false)} className="mt-2">Done</Button>
              </div>
            ) : (

              <>
                <DialogHeader>
                  <DialogTitle>Book your 30-min counseling slot</DialogTitle>
                  <DialogDescription>
                    Free first session. Your timezone: {tz}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cb-name">Name</Label>
                      <Input id="cb-name" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
                    </div>
                    <div>
                      <Label htmlFor="cb-email">Email</Label>
                      <Input id="cb-email" type="email" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cb-date">Date</Label>
                      <Input id="cb-date" type="date" min={todayISO()} value={form.preferred_date}
                        onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="cb-time">Time</Label>
                      <Select value={form.preferred_time}
                        onValueChange={(v) => setForm({ ...form, preferred_time: v })}>
                        <SelectTrigger id="cb-time"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cb-topic">Topic</Label>
                    <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                      <SelectTrigger id="cb-topic"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cb-q">What do you need help with?</Label>
                    <Textarea id="cb-q" rows={4} value={form.question}
                      placeholder="e.g. I'm targeting US CS programs with a 3.7 GPA and need help deciding between EA and RD..."
                      onChange={(e) => setForm({ ...form, question: e.target.value })} maxLength={2000} />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
                  <Button onClick={submit} disabled={submitting}>
                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Booking…</> : "Confirm booking"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CounselingCTA;
