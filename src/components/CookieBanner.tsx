import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const KEY = "univista:cookie-consent:v1";

export const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {}
  }, []);

  const set = (value: "accept" | "reject") => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() }));
    } catch {}
    setShow(false);
    if (value === "reject") {
      // Best-effort opt-out for PostHog
      import("posthog-js").then((m) => {
        try {
          (m as any).default?.opt_out_capturing?.();
        } catch {}
      }).catch(() => {});
    }
  };

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[60] md:max-w-sm rounded-xl border bg-card/95 backdrop-blur shadow-lg p-4"
    >
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">We use cookies</p>
          <p className="text-xs text-muted-foreground mt-1">
            We use essential cookies for authentication and anonymous analytics to improve UniVista.
            See our <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" onClick={() => set("reject")}>
              Reject non-essential
            </Button>
            <Button size="sm" onClick={() => set("accept")}>Accept all</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
