// Creates a Polar.sh checkout session for the logged-in user.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Premium Pass product
const PRODUCT_ID = "89bdfd56-9ed4-492e-9157-79edad363d8b";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const accessToken = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!accessToken) return json({ error: "Polar is not configured" }, 500);

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Not signed in" }, 401);

    const user = userData.user;
    const origin = req.headers.get("origin") ?? "https://univista.inkspirehq.live";

    // Detect sandbox vs production token automatically
    const isSandbox = accessToken.startsWith("polar_oat_") === false &&
                      accessToken.includes("sandbox");
    const apiBase = isSandbox ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";

    const payload = {
      products: [PRODUCT_ID],
      success_url: `${origin}/checkout/success?checkout_id={CHECKOUT_ID}`,
      customer_email: user.email ?? undefined,
      external_customer_id: user.id,
      metadata: { user_id: user.id, email: user.email ?? "" },
    };

    const res = await fetch(`${apiBase}/v1/checkouts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await res.json();
    if (!res.ok) {
      console.error("Polar checkout error", res.status, body);
      return json({ error: "Checkout failed. Please try again." }, 502);
    }

    const url: string | undefined = body?.url;
    if (!url) return json({ error: "No checkout URL returned" }, 502);

    return json({ url, checkout_id: body?.id });
  } catch (e) {
    console.error("checkout fatal", e);
    return json({ error: "Internal server error" }, 500);
  }
});
