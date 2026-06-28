// Unified AI gateway helper for all edge functions.
// - Centralizes model selection, temperature, max_tokens per task
// - Automatic OpenAI <-> Gemini fallback on 5xx / 402 / 429 / empty / invalid JSON
// - Exponential backoff retry per model, then model swap
// - Fire-and-forget diagnostics logging to ai_diagnostics table (admin-visible)
//
// Import in any edge function:
//   import { callAI, extractJSON } from "../_shared/aiGateway.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type TaskName =
  | "profile_score"
  | "uni_matches"
  | "uni_checker"
  | "fit_matrix"
  | "chatbot"
  | "essay"
  | "document"
  | "match_explanations"
  | "visa_qa"
  | "generic";

interface TaskConfig {
  models: string[]; // ordered: primary first, then fallbacks
  temperature?: number;
  max_completion_tokens: number;
}

// Note: gpt-5 family rejects temperature:0 — leave undefined to use server default.
// Speed-tuned: prefer Gemini Flash for primary (sub-10s typical); GPT-5 only as last resort.
export const TASK_CONFIG: Record<TaskName, TaskConfig> = {
  profile_score:       { models: ["google/gemini-2.5-flash", "google/gemini-3-flash-preview", "openai/gpt-5-mini"],   max_completion_tokens: 6000 },
  uni_matches:         { models: ["google/gemini-2.5-flash", "google/gemini-3-flash-preview", "openai/gpt-5-mini"],   max_completion_tokens: 7000 },
  match_explanations:  { models: ["google/gemini-2.5-flash", "google/gemini-3-flash-preview", "openai/gpt-5-mini"],   max_completion_tokens: 6000 },
  uni_checker:         { models: ["google/gemini-2.5-flash", "google/gemini-3-flash-preview", "openai/gpt-5-mini"],   max_completion_tokens: 5000 },
  fit_matrix:          { models: ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "openai/gpt-5-mini"],    max_completion_tokens: 3500 },
  chatbot:             { models: ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "openai/gpt-5-mini"],    temperature: 0.8, max_completion_tokens: 1200 },
  essay:               { models: ["google/gemini-2.5-flash", "google/gemini-3-flash-preview", "openai/gpt-5-mini"],   temperature: 0.3, max_completion_tokens: 3500 },
  document:            { models: ["google/gemini-2.5-flash", "google/gemini-3-flash-preview", "openai/gpt-5-mini"],   max_completion_tokens: 3500 },
  visa_qa:             { models: ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "openai/gpt-5-mini"],    max_completion_tokens: 2000 },
  generic:             { models: ["google/gemini-2.5-flash-lite", "google/gemini-2.5-flash", "openai/gpt-5-mini"],    max_completion_tokens: 3000 },
};

// Tasks where we always race the top-2 models in parallel (first valid wins) for fastest UX.
const HEDGE_BY_DEFAULT: Record<string, boolean> = {
  profile_score: true,
  uni_matches: true,
  match_explanations: true,
  uni_checker: true,
  fit_matrix: true,
  chatbot: true,
  essay: true,
  document: true,
  visa_qa: true,
};

export interface CallAIOptions {
  task: TaskName;
  messages: any[];
  expectJSON?: boolean;     // when true, validates JSON.parse on output and triggers fallback if it fails
  userId?: string | null;   // for diagnostics
  modelOverride?: string;   // skip task primary
  hedge?: boolean;          // race primary + first fallback in parallel; first valid wins
}

export interface CallAIResult {
  content: string;
  model: string;
  latencyMs: number;
  requestId: string;
  attempts: number;
  usedFallback: boolean;
}

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const newRequestId = () =>
  `ai_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// Robust JSON extraction: strips markdown fences and tries to recover
// from trailing commas / truncated braces by trimming to the last balanced }.
export function extractJSON(raw: string): any {
  if (!raw) throw new Error("Empty AI content");
  let txt = raw.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();

  // Take the largest {...} or [...] block
  const firstBrace = Math.min(
    ...[txt.indexOf("{"), txt.indexOf("[")].filter((i) => i >= 0),
  );
  if (Number.isFinite(firstBrace) && firstBrace > 0) txt = txt.slice(firstBrace);

  try { return JSON.parse(txt); } catch { /* try recovery */ }

  // Trim to last balanced closing brace/bracket
  for (let i = txt.length; i > 0; i--) {
    const ch = txt[i - 1];
    if (ch === "}" || ch === "]") {
      try { return JSON.parse(txt.slice(0, i)); } catch { /* keep going */ }
    }
  }
  throw new Error("AI returned unparseable JSON");
}

function logDiagnostic(row: {
  request_id: string;
  user_id: string | null;
  task: string;
  model: string;
  attempt_no: number;
  status: string; // ok | error | fallback | empty | invalid_json | rate_limit | credits | timeout
  http_status?: number;
  latency_ms?: number;
  payload_valid?: boolean;
  error?: string;
}) {
  // Fire-and-forget — never block user response
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) return;
    const supa = createClient(url, key, { auth: { persistSession: false } });
    void supa.from("ai_diagnostics").insert(row).then(({ error }) => {
      if (error) console.error("ai_diagnostics insert failed:", error.message);
    });
  } catch (e) {
    console.error("ai_diagnostics fatal:", e);
  }
}

async function callOnce(
  model: string,
  messages: any[],
  cfg: TaskConfig,
  apiKey: string,
): Promise<{ ok: boolean; status: number; content: string; raw: string }> {
  const body: any = {
    model,
    messages,
    max_completion_tokens: cfg.max_completion_tokens,
  };
  // Only include temperature if explicitly defined in the task (gpt-5 family rejects 0)
  if (cfg.temperature !== undefined && !/gpt-5/i.test(model)) {
    body.temperature = cfg.temperature;
  }

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    return { ok: false, status: res.status, content: "", raw: errText };
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "";
  return { ok: true, status: 200, content, raw: "" };
}

export async function callAI(opts: CallAIOptions): Promise<CallAIResult> {
  const cfg = TASK_CONFIG[opts.task] || TASK_CONFIG.generic;
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const requestId = newRequestId();
  const models = opts.modelOverride
    ? [opts.modelOverride, ...cfg.models.filter((m) => m !== opts.modelOverride)]
    : cfg.models;

  const startedAll = performance.now();
  let attempts = 0;
  let lastErr = "";
  let lastStatus = 0;

  // ---------- Hedged parallel mode: race primary + first fallback, first valid wins.
  const shouldHedge = (opts.hedge ?? HEDGE_BY_DEFAULT[opts.task]) === true;
  if (shouldHedge && models.length >= 2) {
    const racers = models.slice(0, 2).map((model, idx) =>
      (async () => {
        const started = performance.now();
        const result = await callOnce(model, opts.messages, cfg, apiKey);
        const latency = Math.round(performance.now() - started);
        if (!result.ok) {
          logDiagnostic({
            request_id: requestId, user_id: opts.userId ?? null,
            task: opts.task, model, attempt_no: idx + 1,
            status: result.status === 429 ? "rate_limit" : result.status === 402 ? "credits" : "error",
            http_status: result.status, latency_ms: latency,
            payload_valid: false, error: result.raw.slice(0, 500),
          });
          throw new Error(`hedge model ${model} http ${result.status}`);
        }
        if (!result.content?.trim()) {
          logDiagnostic({
            request_id: requestId, user_id: opts.userId ?? null,
            task: opts.task, model, attempt_no: idx + 1, status: "empty",
            http_status: 200, latency_ms: latency, payload_valid: false, error: "empty",
          });
          throw new Error(`hedge model ${model} empty`);
        }
        if (opts.expectJSON) {
          try { extractJSON(result.content); } catch (e) {
            logDiagnostic({
              request_id: requestId, user_id: opts.userId ?? null,
              task: opts.task, model, attempt_no: idx + 1, status: "invalid_json",
              http_status: 200, latency_ms: latency, payload_valid: false,
              error: e instanceof Error ? e.message : "invalid json",
            });
            throw e;
          }
        }
        logDiagnostic({
          request_id: requestId, user_id: opts.userId ?? null,
          task: opts.task, model, attempt_no: idx + 1,
          status: idx === 0 ? "ok" : "fallback",
          http_status: 200, latency_ms: latency, payload_valid: true,
        });
        return { content: result.content, model, latency };
      })()
    );
    try {
      const winner = await Promise.any(racers);
      return {
        content: winner.content,
        model: winner.model,
        latencyMs: Math.round(performance.now() - startedAll),
        requestId,
        attempts: 2,
        usedFallback: winner.model !== models[0],
      };
    } catch {
      // both racers failed — fall through to sequential retry path
    }
  }


  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    const isFallback = mi > 0;

    for (let attempt = 1; attempt <= 2; attempt++) {
      attempts++;
      const started = performance.now();
      try {
        const result = await callOnce(model, opts.messages, cfg, apiKey);
        const latency = Math.round(performance.now() - started);

        if (!result.ok) {
          lastStatus = result.status;
          lastErr = result.raw.slice(0, 500);
          const status =
            result.status === 429 ? "rate_limit" :
            result.status === 402 ? "credits" :
            "error";
          logDiagnostic({
            request_id: requestId, user_id: opts.userId ?? null,
            task: opts.task, model, attempt_no: attempts, status,
            http_status: result.status, latency_ms: latency,
            payload_valid: false, error: lastErr,
          });
          // 402 — no point retrying same model; jump to next
          if (result.status === 402) break;
          // 429 — single backoff then retry same model
          if (result.status === 429 && attempt === 1) { await sleep(900); continue; }
          // 5xx — retry once with backoff
          if (result.status >= 500 && attempt === 1) { await sleep(400); continue; }
          break;
        }

        // Empty content — try fallback model
        if (!result.content || !result.content.trim()) {
          lastErr = "empty content";
          logDiagnostic({
            request_id: requestId, user_id: opts.userId ?? null,
            task: opts.task, model, attempt_no: attempts, status: "empty",
            http_status: 200, latency_ms: latency, payload_valid: false,
            error: "Empty content from model",
          });
          break;
        }

        // JSON validation
        if (opts.expectJSON) {
          try {
            extractJSON(result.content);
          } catch (e) {
            lastErr = e instanceof Error ? e.message : "invalid json";
            logDiagnostic({
              request_id: requestId, user_id: opts.userId ?? null,
              task: opts.task, model, attempt_no: attempts, status: "invalid_json",
              http_status: 200, latency_ms: latency, payload_valid: false,
              error: lastErr,
            });
            // retry once at higher attempt count, then fallback
            if (attempt === 1) { await sleep(250); continue; }
            break;
          }
        }

        // Success
        logDiagnostic({
          request_id: requestId, user_id: opts.userId ?? null,
          task: opts.task, model, attempt_no: attempts,
          status: isFallback || attempts > 1 ? "fallback" : "ok",
          http_status: 200, latency_ms: latency, payload_valid: true,
        });

        return {
          content: result.content,
          model,
          latencyMs: Math.round(performance.now() - startedAll),
          requestId,
          attempts,
          usedFallback: isFallback || attempts > 1,
        };
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        logDiagnostic({
          request_id: requestId, user_id: opts.userId ?? null,
          task: opts.task, model, attempt_no: attempts, status: "error",
          latency_ms: Math.round(performance.now() - started),
          payload_valid: false, error: lastErr,
        });
        if (attempt === 1) { await sleep(400); continue; }
        break;
      }
    }
  }

  // All models exhausted
  const err = new Error(`AI gateway failed (last status ${lastStatus}): ${lastErr || "unknown"}`);
  (err as any).requestId = requestId;
  (err as any).lastStatus = lastStatus;
  throw err;
}

// Helper: standard error response that the client can render with AIErrorState.
export function aiErrorResponse(
  e: unknown,
  cors: Record<string, string>,
  fallbackStatus = 500,
) {
  const lastStatus = (e as any)?.lastStatus ?? fallbackStatus;
  const requestId = (e as any)?.requestId ?? null;
  const message =
    lastStatus === 402 ? "AI credits exhausted. Please add credits to continue." :
    lastStatus === 429 ? "AI is rate-limited. Please retry in a few seconds." :
    e instanceof Error ? e.message : "AI request failed";
  return new Response(
    JSON.stringify({ success: false, error: message, requestId, status: lastStatus }),
    { status: lastStatus === 402 || lastStatus === 429 ? lastStatus : 500,
      headers: { ...cors, "Content-Type": "application/json" } },
  );
}
