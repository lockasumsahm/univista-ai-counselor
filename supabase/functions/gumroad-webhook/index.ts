// Gumroad "Ping" webhook → auto-activates Premium Pass
// Configure in Gumroad: Settings → Advanced → Ping → set URL to this function
// REQUIRED secrets:
//   - GUMROAD_PRODUCT_PERMALINK  (locks webhook to a single product)
//   - GUMROAD_SELLER_ID          (locks webhook to your seller account)
//   - GUMROAD_WEBHOOK_SECRET     (shared secret appended to the URL as ?secret=...)
//
// Security model: Gumroad's legacy Ping webhook has no HMAC signature, so we
// rely on (1) a non-guessable URL secret, (2) strict equality on the seller and
// product, and (3) parking unknown emails for manual admin review instead of
// auto-approving them. All three checks must pass; missing config = 500.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── Required configuration ───────────────────────────────────────────────
    const expectedProduct = Deno.env.get("GUMROAD_PRODUCT_PERMALINK");
    const expectedSeller  = Deno.env.get("GUMROAD_SELLER_ID");
    const expectedSecret  = Deno.env.get("GUMROAD_WEBHOOK_SECRET");

    if (!expectedProduct || !expectedSeller || !expectedSecret) {
      console.error("[gumroad-webhook] missing required env vars");
      return json({ ok: false, error: "webhook not configured" }, 500);
    }

    // ── 1. Shared-secret URL check (?secret=... or X-Webhook-Secret header) ─
    const url = new URL(req.url);
    const providedSecret =
      url.searchParams.get("secret") ||
      req.headers.get("x-webhook-secret") ||
      "";
    // Constant-time compare
    const a = new TextEncoder().encode(providedSecret);
    const b = new TextEncoder().encode(expectedSecret);
    let mismatch = a.length !== b.length ? 1 : 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) mismatch |= a[i] ^ b[i];
    if (mismatch !== 0) {
      console.warn("[gumroad-webhook] secret mismatch");
      return json({ ok: false, error: "unauthorized" }, 401);
    }

    // ── 2. Parse payload ────────────────────────────────────────────────────
    const ct = req.headers.get("content-type") || "";
    let params: Record<string, string> = {};
    if (ct.includes("application/json")) {
      params = await req.json();
    } else {
      const form = await req.formData();
      form.forEach((v, k) => { params[k] = String(v); });
    }

    const email = (params.email || params.purchaser_email || "").trim().toLowerCase();
    const saleId = params.sale_id || params.order_number || params.sale_timestamp || "";
    const productPermalink = params.product_permalink || params.permalink || "";
    const sellerId = params.seller_id || "";
    const refunded = params.refunded === "true";
    const test = params.test === "true";

    if (!email) return json({ ok: false, error: "missing email" }, 400);

    // ── 3. Strict product + seller equality (no longer optional) ────────────
    if (productPermalink !== expectedProduct) {
      console.warn("[gumroad-webhook] product mismatch", { productPermalink });
      return json({ ok: false, error: "product mismatch" }, 401);
    }
    if (sellerId !== expectedSeller) {
      console.warn("[gumroad-webhook] seller mismatch", { sellerId });
      return json({ ok: false, error: "seller mismatch" }, 401);
    }

    if (refunded || test) {
      return json({ ok: true, skipped: refunded ? "refund" : "test" });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find user by email via profiles, fallback to auth.users via admin API
    let userId: string | null = null;
    const { data: profile } = await supabase
      .from("profiles").select("user_id").eq("email", email).maybeSingle();
    userId = profile?.user_id ?? null;

    if (!userId) {
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users.find((u) => (u.email || "").toLowerCase() === email);
      userId = found?.id ?? null;
    }

    if (!userId) {
      // No matching user yet. user_id is NOT NULL on payment_review_requests,
      // so we cannot pre-park the row. Log it and require manual admin action
      // once the user signs up — safer than auto-approving an unknown account.
      console.log("[gumroad-webhook] no user for", email, "— manual review required");
      return json({ ok: true, parked: true, manualReviewRequired: true });
    }

    // Insert as approved → existing trigger activates premium pass
    const { error } = await supabase.from("payment_review_requests").insert({
      user_id: userId,
      payment_reference: saleId || `gumroad-${Date.now()}`,
      payer_email: email,
      amount_cad: 20,
      status: "approved",
      admin_notes: "Auto-approved via Gumroad webhook (secret + product + seller verified)",
    });

    if (error) {
      console.error("[gumroad-webhook] insert error", error);
      return json({ ok: false, error: error.message }, 500);
    }

    return json({ ok: true, activated: true });
  } catch (e) {
    console.error("[gumroad-webhook] error", e);
    return json({ ok: false, error: "internal error" }, 500);
  }
});
