import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const DISMISS_KEY = "outcome-nudge-dismissed-until";

export const OutcomeNudge = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (until > Date.now()) return;

    (async () => {
      try {
        const { count } = await supabase
          .from("university_matches")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .lt("created_at", new Date(Date.now() - 14 * 86400_000).toISOString());
        if (!count) return;
        const { count: outcomes } = await supabase
          .from("match_outcomes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if ((outcomes ?? 0) === 0) setShow(true);
      } catch {
        /* no-op */
      }
    })();
  }, [user]);

  if (!show) return null;

  return (
    <Card className="p-4 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-0.5">Heard back from any school?</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Logging your real admit / waitlist / deny outcomes powers our calibration engine for future students.
          </p>
          <div className="flex gap-2 mt-2">
            <Button asChild size="sm" className="h-8 text-xs">
              <Link to="/universities">Log outcomes</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => {
                localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 86400_000));
                setShow(false);
              }}
            >
              Remind me later
            </Button>
          </div>
        </div>
        <button
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, String(Date.now() + 30 * 86400_000));
            setShow(false);
          }}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};
