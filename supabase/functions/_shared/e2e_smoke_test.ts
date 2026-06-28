// End-to-end smoke tests for the core AI edge functions.
// Run:  deno test --allow-net --allow-env supabase/functions/_shared/e2e_smoke_test.ts
//
// Each test hits the LIVE deployed function with a minimal-but-valid payload and
// asserts the function either succeeds OR degrades gracefully (returns a structured
// fallback response — never a 500). This catches broken paths before release.
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

function url(fn: string) {
  return `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${fn}`;
}

async function call(fn: string, body: unknown) {
  const res = await fetch(url(fn), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ANON}`,
      "apikey": ANON,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: res.status, text, json: json as Record<string, unknown> | null };
}

const PROFILE = {
  gpa: 3.85,
  testScores: { sat: 1480 },
  extracurriculars: ["Math Olympiad — National Finalist", "Debate Club President"],
  targetCountry: "USA",
  intendedMajor: "Computer Science",
  grade: "12",
};

Deno.test("E2E ▸ chatbot-counselor responds (or degrades gracefully)", async () => {
  const r = await call("chatbot-counselor", {
    message: "What should I focus on for Ivy League apps?",
    history: [],
    profile: PROFILE,
  });
  assert(r.status < 500, `chatbot returned ${r.status}: ${r.text.slice(0,200)}`);
  assert(r.json, "chatbot response is not JSON");
});

Deno.test("E2E ▸ verified-admits-match returns synthesized or scored admits", async () => {
  const r = await call("verified-admits-match", { profile: PROFILE, university: "Stanford" });
  assert(r.status < 500, `admits returned ${r.status}: ${r.text.slice(0,200)}`);
  assert(r.json, "admits response is not JSON");
});

Deno.test("E2E ▸ analyze-document (CV analysis) returns structured result", async () => {
  const r = await call("analyze-document", {
    documentType: "cv",
    text: "John Doe — GPA 3.9. President of Robotics Club. Published research in IEEE.",
    profile: PROFILE,
  });
  assert(r.status < 500, `cv-analysis returned ${r.status}: ${r.text.slice(0,200)}`);
  assert(r.json, "cv-analysis response is not JSON");
});

Deno.test("E2E ▸ university-counselor (roadmap) returns content", async () => {
  const r = await call("university-counselor", {
    profile: PROFILE,
    mode: "roadmap",
    question: "Give me a 12-month plan to strengthen my Ivy League application.",
  });
  assert(r.status < 500, `roadmap returned ${r.status}: ${r.text.slice(0,200)}`);
  assert(r.json, "roadmap response is not JSON");
});
