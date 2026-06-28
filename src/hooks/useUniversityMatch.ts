import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  selectCandidates,
  profileHash,
  type SelectionResult,
} from "@/lib/matchEngine";
import { buildCandidatePool } from "@/lib/universityData";
import { invokeEdgeFunction } from "@/lib/edgeFunctions";
import { pushNotification } from "@/lib/notify";
import { calibrateResults } from "@/lib/calibration";
import { applyMajorAdjustments } from "@/lib/majorRates";
import type { CounselorBlocks } from "@/components/match/CounselorCorner";

export interface MatchState {
  selection: SelectionResult | null;
  ai: Record<string, CounselorBlocks>;
  loading: boolean;
  aiLoading: boolean;
  error: string | null;
  status: "idle" | "ok" | "credits" | "rateLimit" | "error";
  usedGlobalFallback: boolean;
}


// Banned words/phrases applied as a post-generation tone guard.
const BANNED_PATTERNS = [
  /\bamazing\b/gi,
  /\bincredible\b/gi,
  /\bconcerning\b/gi,
  /\bperfect\b/gi,
  /\bterrible\b/gi,
  /\bguarantee\w*\b/gi,
  /\bpredict\w*\b/gi,
  /\bchances?\b/gi,
  /\bprobabilit\w+\b/gi,
  /strong profile/gi,
  /stand out(?: from the crowd)?/gi,
  /showcase your passion/gi,
  /unleash your potential/gi,
  /dream school/gi,
  /world-class/gi,
];

const stripBanned = (text: string): string => {
  if (!text) return text;
  let out = text;
  for (const re of BANNED_PATTERNS) out = out.replace(re, "—");
  // collapse double-em-dashes
  return out.replace(/—\s*—/g, "—").replace(/\s+—\s+\./g, ".").trim();
};

const sanitizeBlocks = (b: any): CounselorBlocks => {
  // Always returns a non-blank shape so the UI never renders empty sections.
  const safe = b && typeof b === "object" ? b : {};
  const lp = Array.isArray(safe.leveragePoints) ? safe.leveragePoints : [];
  const sanitizedLP = lp.slice(0, 3).map((p: any) => ({
    factor: String(p?.factor || "Profile factor"),
    why: stripBanned(p?.why || "") || "Engine surfaced this as a high-leverage gap for this school.",
    action: stripBanned(p?.action || "") || "Open the roadmap to add a concrete 30-day plan.",
  }));
  // Pad to exactly 3 entries
  while (sanitizedLP.length < 3) {
    sanitizedLP.push({
      factor: "Application strength",
      why: "Add more profile detail so the engine can surface a sharper leverage point here.",
      action: "Complete your profile and upload supporting documents.",
    });
  }
  return {
    bottomLine:
      stripBanned(safe.bottomLine || "") ||
      "Counselor brief loading — your engine result is ready below in Show Math.",
    leveragePoints: sanitizedLP,
    whatThisSchoolWeighs:
      stripBanned(safe.whatThisSchoolWeighs || "") ||
      "Reviewed against the school's published priorities. See verified data link on the card.",
    honestTakeForOrigin:
      stripBanned(safe.honestTakeForOrigin || "") ||
      "Add your country in your profile to unlock origin-aware context here.",
  };
};

export const useUniversityMatch = (profile: any) => {
  const { user } = useAuth();
  const notifiedHashRef = useRef<string | null>(null);
  const [state, setState] = useState<MatchState>({
    selection: null,
    ai: {},
    loading: false,
    aiLoading: false,
    error: null,
    status: "idle",
    usedGlobalFallback: false,
  });

  const run = useCallback(async () => {
    if (!profile || !user) return;

    const hash = profileHash(profile);
    const cacheKey = `uniMatch:${user.id}:${hash}`;

    setState((s) => ({ ...s, loading: true, error: null, status: "idle" }));

    const pool = buildCandidatePool(
      profile?.target_countries || profile?.preferredCountries,
    );
    const usedGlobalFallback = (pool as any).usedGlobalFallback === true;
    const baseSelection = selectCandidates(profile, pool);

    // ── Pass 3: Major-specific admit-rate adjustment LAYER ────────
    // Applied BEFORE calibration so the calibration factor is computed
    // against the major-adjusted score (consistent with how outcomes
    // are recorded). Pure no-op when no row for (uni, major) exists.
    const intendedMajor: string | null =
      profile?.intended_major || profile?.intendedMajor || null;
    let workingIncluded = baseSelection.included as any[];
    let workingTopPick = baseSelection.topPick as any;
    let workingTopByCountry: Record<string, any> = { ...baseSelection.topPickByCountry };
    try {
      const [adjIncluded, adjTop, adjByCountryArr] = await Promise.all([
        applyMajorAdjustments(baseSelection.included, intendedMajor),
        baseSelection.topPick
          ? applyMajorAdjustments([baseSelection.topPick], intendedMajor).then((r) => r[0])
          : Promise.resolve(null),
        applyMajorAdjustments(Object.values(baseSelection.topPickByCountry), intendedMajor),
      ]);
      workingIncluded = adjIncluded;
      workingTopPick = adjTop ?? workingTopPick;
      workingTopByCountry = Object.fromEntries(adjByCountryArr.map((r) => [r.country, r]));
    } catch (e) {
      console.warn("[useUniversityMatch] major-rate layer failed; using base scores", e);
    }

    // ── Pass 1: Outcome-Driven Calibration LAYER ──────────────────
    let selection: SelectionResult = baseSelection;
    try {
      const [includedCal, topPickCal, topByCountryCalEntries] = await Promise.all([
        calibrateResults(workingIncluded, intendedMajor),
        workingTopPick
          ? calibrateResults([workingTopPick], intendedMajor).then((r) => r[0])
          : Promise.resolve(null),
        calibrateResults(Object.values(workingTopByCountry), intendedMajor)
          .then((arr) => arr.map((r) => [r.country, r] as const)),
      ]);
      const reSorted = [...includedCal].sort((a, b) => b.score - a.score);
      selection = {
        included: reSorted,
        notIncluded: baseSelection.notIncluded,
        topPick: topPickCal ?? (workingTopPick as any),
        topPickByCountry: Object.fromEntries(topByCountryCalEntries),
      };
    } catch (e) {
      console.warn("[useUniversityMatch] calibration layer failed; using base scores", e);
      selection = {
        included: workingIncluded as any,
        notIncluded: baseSelection.notIncluded,
        topPick: workingTopPick as any,
        topPickByCountry: workingTopByCountry as any,
      };
    }
    setState((s) => ({ ...s, selection, loading: false, aiLoading: true, usedGlobalFallback }));

    // In-browser hash cache — instant return when the profile hasn't changed.
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.ai && Object.keys(parsed.ai).length > 0) {
          setState((s) => ({ ...s, ai: parsed.ai, aiLoading: false, status: "ok" }));
          return;
        }
      }
    } catch { /* ignore cache parse errors */ }


    // One persistent notification per user, refreshed when the top pick changes.
    if (selection.topPick && notifiedHashRef.current !== hash) {
      notifiedHashRef.current = hash;
      const tp = selection.topPick;
      pushNotification(user.id, {
        title: `Your #1 best-chance university: ${tp.universityName}`,
        message: `${tp.range.min}–${tp.range.max}% alignment · ${tp.country} · ${tp.category}. Open University Alignment to see why.`,
        link: "/dashboard/matches",
        type: "success",
        dedupeKey: "top_pick",
        suppressIfVisited: "/dashboard/matches",
      });
    }

    const { data: cached } = await supabase
      .from("university_matches")
      .select("ai_explanations")
      .eq("user_id", user.id)
      .eq("profile_hash", hash)
      .maybeSingle();

    const cachedAI: Record<string, CounselorBlocks> = (cached?.ai_explanations as any) || {};

    const need = selection.included.filter((r) => !cachedAI[r.universityName]);

    if (need.length === 0) {
      setState((s) => ({ ...s, ai: cachedAI, aiLoading: false, status: "ok" }));
      return;
    }

    try {
      // Inject the user's uploaded CV text (this session) so the AI counselor
      // actually reads the resume alongside the structured profile fields.
      let cvText: string | undefined;
      try {
        const stored = sessionStorage.getItem(`cvText:${user.id}`);
        if (stored && stored.length > 50) cvText = stored.slice(0, 12000);
      } catch {}

      const { data, status } = await invokeEdgeFunction("university-counselor", {
        action: "matchExplanations",
        profile,
        cvText,
        universities: need.map((r) => ({
          name: r.universityName,
          country: r.country,
          narrativeAngle: r.narrativeAngle,
          category: r.category,
          score: r.score,
          internationalContext: r.internationalContext,
          priorities: r.priorities,
          leveragePoints: r.leveragePoints,
          factorBreakdown: r.factorBreakdown.map((f) => ({
            factor: f.factor,
            studentValue: f.studentValue,
            universityValue: f.universityValue,
            factorScore: f.factorScore,
          })),
        })),
      });

      if (status === 402) {
        setState((s) => ({ ...s, ai: cachedAI, aiLoading: false, status: "credits" }));
        return;
      }
      if (status === 429) {
        setState((s) => ({ ...s, ai: cachedAI, aiLoading: false, status: "rateLimit" }));
        return;
      }

      const rawFresh: Record<string, any> = data?.result?.explanations || {};
      const fresh: Record<string, CounselorBlocks> = {};
      for (const [name, blocks] of Object.entries(rawFresh)) {
        fresh[name] = sanitizeBlocks(blocks);
      }
      // Engine-side fallback: any selected uni without an AI block gets a clean default.
      for (const r of selection.included) {
        if (!fresh[r.universityName] && !cachedAI[r.universityName]) {
          fresh[r.universityName] = sanitizeBlocks(null);
        }
      }
      const merged = { ...cachedAI, ...fresh };

      await supabase.from("university_matches").upsert(
        {
          user_id: user.id,
          profile_hash: hash,
          engine_result: selection as any,
          ai_explanations: merged as any,
        },
        { onConflict: "user_id,profile_hash" },
      );

      try { sessionStorage.setItem(cacheKey, JSON.stringify({ ai: merged })); } catch {}
      setState((s) => ({ ...s, ai: merged, aiLoading: false, status: "ok" }));
    } catch (e) {
      console.error("AI explanations failed", e);
      setState((s) => ({
        ...s,
        ai: cachedAI,
        aiLoading: false,
        status: "error",
        error: e instanceof Error ? e.message : "Unknown error",
      }));
    }
  }, [profile, user]);

  return { ...state, run };
};
