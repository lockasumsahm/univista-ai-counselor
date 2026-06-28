const POSTHOG_KEY = "phc_tirUCcSa7ZbRCDmrceL89vcydPXBmuAzuFN2JrbPSXVJ";
const POSTHOG_HOST = "https://us.i.posthog.com";

let phPromise: Promise<any> | null = null;
let ready = false;

function load() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.location.hostname === "localhost") return Promise.resolve(null);
  if (!phPromise) {
    phPromise = import("posthog-js").then((mod) => {
      const ph = (mod as any).default ?? mod;
      try {
        // Respect cookie consent: opt out by default if user rejected.
        let consent: string | null = null;
        try {
          const raw = localStorage.getItem("univista:cookie-consent:v1");
          if (raw) consent = JSON.parse(raw)?.value ?? null;
        } catch {}
        ph.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: "identified_only",
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: true,
          // Session Replay + Heatmaps
          session_recording: {
            maskAllInputs: true,
            maskTextSelector: "[data-private], input[type=password], input[type=email]",
          },
          disable_session_recording: consent === "reject",
          enable_heatmaps: true,
          opt_out_capturing_by_default: consent === "reject",
        });
        ready = true;
      } catch (e) {
        console.warn("PostHog init failed", e);
      }
      return ph;
    }).catch((e) => {

      console.warn("PostHog load failed", e);
      return null;
    });
  }
  return phPromise;
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  // Defer to idle so it never blocks first paint or triggers dep re-optimization at boot.
  const schedule = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 1500));
  schedule(() => { void load(); });
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  void load().then((ph) => { if (ph && ready) try { ph.identify(userId, traits); } catch {} });
}

export function resetAnalytics() {
  void load().then((ph) => { if (ph && ready) try { ph.reset(); } catch {} });
}

export function trackEvent(name: string, props?: Record<string, any>) {
  void load().then((ph) => { if (ph && ready) try { ph.capture(name, props); } catch {} });
}
