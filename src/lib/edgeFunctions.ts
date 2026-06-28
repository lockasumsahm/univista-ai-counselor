import { supabase } from "@/integrations/supabase/client";
import { toUnifiedProfile } from "@/lib/profileSchema";

/**
 * Inject the unified profile schema into every edge-function payload that
 * carries a `profile`. Downstream AI / scoring engines should prefer
 * `profile.unified` over legacy flat fields. This is the single
 * compatibility layer — no module should call the adapter directly.
 */
function withUnifiedProfile(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== "object") return body;
  if (!body.profile || typeof body.profile !== "object") return body;
  // Avoid re-wrapping if caller already attached a unified payload.
  if (body.profile.unified && typeof body.profile.unified === "object") return body;
  try {
    const unified = toUnifiedProfile(body.profile);
    return { ...body, profile: { ...body.profile, unified } };
  } catch {
    return body;
  }
}

/**
 * Calls a Supabase Edge Function with the authenticated session JWT.
 * If the session is missing/expired, attempts a refresh; if still no token
 * (or the function returns 401 indicating a stale token), forces a sign-out
 * and redirects to /auth so the user can re-authenticate cleanly.
 */
async function forceReauth() {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore — we still want to redirect
  }
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
    window.location.href = "/auth";
  }
}

export interface EdgeFunctionMeta {
  model?: string;
  latencyMs?: number;
  requestId?: string;
  attempts?: number;
  usedFallback?: boolean;
}

export interface EdgeFunctionResult {
  data: any;
  status: number;
  meta?: EdgeFunctionMeta;
  requestId?: string | null;
}

export async function invokeEdgeFunction(
  functionName: string,
  body: Record<string, any>
): Promise<EdgeFunctionResult> {
  let { data: sessionData } = await supabase.auth.getSession();
  let token = sessionData?.session?.access_token;

  if (!token) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    token = refreshed?.session?.access_token;
  }

  if (!token) {
    await forceReauth();
    return { data: null, status: 401 };
  }

  const wrappedBody = withUnifiedProfile(body);

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: wrappedBody,
    headers: { Authorization: `Bearer ${token}` },
  });

  if (error) {
    const msg = error.message || "";
    const ctx: any = (error as any).context;
    const status = ctx?.status;
    // Try to read requestId from the failure body if present
    let requestId: string | null = null;
    try {
      if (ctx?.body) {
        const parsed = typeof ctx.body === "string" ? JSON.parse(ctx.body) : ctx.body;
        requestId = parsed?.requestId ?? null;
      }
    } catch { /* ignore */ }

    if (status === 401 || msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      const newToken = refreshed?.session?.access_token;
      if (newToken && newToken !== token) {
        const retry = await supabase.functions.invoke(functionName, {
          body: wrappedBody,
          headers: { Authorization: `Bearer ${newToken}` },
        });
        if (!retry.error) return { data: retry.data, status: 200, meta: retry.data?.meta, requestId: retry.data?.meta?.requestId ?? null };
      }
      await forceReauth();
      return { data: null, status: 401, requestId };
    }

    if (status === 402 || msg.includes("402") || msg.includes("credits")) {
      return { data: null, status: 402, requestId };
    }
    if (status === 429 || msg.includes("429") || msg.includes("rate")) {
      return { data: null, status: 429, requestId };
    }
    if (status) {
      return { data: null, status, requestId };
    }
    throw error;
  }

  return {
    data,
    status: 200,
    meta: data?.meta,
    requestId: data?.meta?.requestId ?? null,
  };
}
