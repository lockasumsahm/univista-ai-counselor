// Polar.sh webhook → activates Premium Pass on order.paid / checkout.updated (succeeded).
// Verifies signature using Standard Webhooks spec with POLAR_WEBHOOK_SECRET.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, webhook-id, webhook-timestamp, webhook-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("POLAR_WEBHOOK_SECRET");
  if (!secret) {
    console.error("Missing POLAR_WEBHOOK_SECRET");
    return new Response("Server misconfigured", { status: 500 });
  }

  const raw = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => { headers[k] = v; });

  let event: any;
  try {
    // Polar provides the secret as a plain string; Standard Webhooks expects base64.
    const base64Secret = btoa(secret);
    const wh = new Webhook(base64Secret);
    event = wh.verify(raw, headers);
  } catch (err) {
    console.warn("Invalid signature", (err as Error).message);
    return new Response("Invalid signature", { status: 401 });
  }

  const eventType: string = event?.type ?? "";
  const data = event?.data ?? {};

  // Try to locate user id from metadata or external_customer_id
  const userId: string | undefined =
    data?.metadata?.user_id ||
    data?.customer?.external_id ||
    data?.external_customer_id ||
    data?.checkout?.metadata?.user_id;

  const orderId: string | undefined = data?.id ?? data?.checkout_id;
  const amountCents: number | undefined = data?.amount ?? data?.total_amount;
  const amountCad = typeof amountCents === "number" ? amountCents / 100 : 20;

  console.log("Polar webhook", { eventType, userId, orderId });

  if (!userId) {
    console.warn("No user_id in metadata — cannot attribute event");
    return new Response("ok (no user)", { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const activateEvents = new Set([
    "order.paid",
    "order.created",
    "checkout.updated",
    "subscription.created",
    "subscription.active",
  ]);
  const deactivateEvents = new Set([
    "order.refunded",
    "subscription.revoked",
    "subscription.canceled",
  ]);

  try {
    // For checkout.updated, only activate when status is succeeded
    if (eventType === "checkout.updated" && data?.status !== "succeeded") {
      return new Response("ok (ignored status)", { status: 200, headers: corsHeaders });
    }

    if (activateEvents.has(eventType)) {
      const { data: existing } = await supabase
        .from("premium_passes")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("premium_passes")
          .update({ active: true, payment_ref: orderId ?? "polar", amount_cad: amountCad })
          .eq("id", existing.id);
      } else {
        await supabase.from("premium_passes").insert({
          user_id: userId,
          active: true,
          payment_ref: orderId ?? "polar",
          amount_cad: amountCad,
        });
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Premium Pass activated 🎉",
        message: "All AdmitIQ Premium tools are unlocked. Enjoy!",
        type: "success",
      });
    } else if (deactivateEvents.has(eventType)) {
      await supabase
        .from("premium_passes")
        .update({ active: false })
        .eq("user_id", userId);
    } else {
      console.log("Ignoring event", eventType);
    }
  } catch (e) {
    console.error("DB error", e);
    return new Response("DB error", { status: 500 });
  }

  return new Response("ok", { status: 200, headers: corsHeaders });
});
