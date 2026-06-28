import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.string().trim().min(1).max(30),
  timezone: z.string().trim().max(80).optional().nullable(),
  topic: z.string().trim().min(1).max(120),
  question: z.string().trim().min(5).max(2000),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: inserted, error: insertErr } = await admin
      .from("counseling_bookings")
      .insert({
        user_id: userData.user.id,
        ...parsed.data,
      })
      .select("id, preferred_date, preferred_time")
      .single();

    if (insertErr) {
      console.error("book-counseling insert", insertErr);
      return new Response(JSON.stringify({ error: "Could not save booking" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort transactional email via Resend (no-op if key not configured)
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const { name, email, preferred_date, preferred_time, timezone, topic, question } = parsed.data;
      const counselorTo = "inkspire528@gmail.com";
      const subj = `UniVista counseling request — ${name} (${preferred_date} ${preferred_time})`;
      const studentHtml = `<div style="font-family:system-ui,sans-serif;max-width:560px"><h2 style="color:#0f172a">Your counseling slot is in</h2><p>Hi ${name}, we received your request for <strong>${preferred_date}</strong> at <strong>${preferred_time}</strong>${timezone ? ` (${timezone})` : ""}.</p><p><strong>Topic:</strong> ${topic}</p><p>Your counselor will email you to confirm within 24h.</p><p style="color:#64748b;font-size:12px">— UniVista</p></div>`;
      const counselorHtml = `<div style="font-family:system-ui,sans-serif"><h3>New booking</h3><p><strong>${name}</strong> &lt;${email}&gt;</p><p><strong>When:</strong> ${preferred_date} ${preferred_time} ${timezone ?? ""}</p><p><strong>Topic:</strong> ${topic}</p><p><strong>Question:</strong><br>${question.replace(/</g, "&lt;")}</p></div>`;
      const send = (to: string, subject: string, html: string) =>
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
          body: JSON.stringify({ from: "UniVista <onboarding@resend.dev>", to: [to], subject, html }),
        }).catch((e) => console.error("resend send", to, e));
      await Promise.all([send(email, "Your UniVista counseling request is in", studentHtml), send(counselorTo, subj, counselorHtml)]);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        booking_id: inserted.id,
        message: "Booking received. You'll get a confirmation email shortly.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("book-counseling error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
