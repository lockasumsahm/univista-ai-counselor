import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * admin-list-users — owner-only admin endpoint.
 *
 * Security model:
 *  1. JWT validated against Supabase Auth.
 *  2. user_roles is the authoritative gate (DB-level role lookup).
 *  3. Every successful access is written to admin_access_log.
 *  4. Service-role client used ONLY after admin verification.
 *
 * Response: paginated list of users with profile + match summary, plus
 * (when targetUserId is supplied) signed download URLs for that user's
 * documents.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Auth client (validates the caller's JWT under their RLS context)
    const supaAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: userErr,
    } = await supaAuth.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    // Authoritative admin check via the protected roles table.
    const { data: roleRow, error: roleErr } = await supaAuth
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleRow) {
      console.error("Admin check failed:", roleErr?.message, "hasAdminRole:", !!roleRow);
      return json({ error: "Forbidden" }, 403);
    }

    // From here on: service-role client (admin verified)
    const supaSvc = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Accept params from query string OR JSON body (functions.invoke uses body)
    const url = new URL(req.url);
    let body: Record<string, any> = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const targetUserId =
      url.searchParams.get("targetUserId") || body.targetUserId || null;
    const search = (
      url.searchParams.get("search") || body.search || ""
    ).toString().trim().toLowerCase();
    const limit = Math.min(
      parseInt(
        url.searchParams.get("limit") || String(body.limit ?? 50),
        10,
      ),
      100,
    );

    // ── Detail view ────────────────────────────────────────────────
    if (targetUserId) {
      await supaSvc.from("admin_access_log").insert({
        admin_user_id: user.id,
        target_user_id: targetUserId,
        table_accessed: "user_detail",
        action: "view_detail",
      });

      const [
        { data: profile },
        { data: factorScores },
        { data: matches },
        { data: outcomes },
        { data: applications },
        { data: deadlines },
        { data: programs },
        { data: documents },
        { data: chats },
        { data: interviews },
      ] = await Promise.all([
        supaSvc.from("profiles").select("*").eq("user_id", targetUserId).maybeSingle(),
        supaSvc.from("factor_scores").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }),
        supaSvc.from("university_matches").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }).limit(5),
        supaSvc.from("match_outcomes").select("*").eq("user_id", targetUserId),
        supaSvc.from("user_applications").select("*").eq("user_id", targetUserId),
        supaSvc.from("user_deadlines").select("*").eq("user_id", targetUserId),
        supaSvc.from("user_programs").select("*").eq("user_id", targetUserId),
        supaSvc.from("document_analyses").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }),
        supaSvc.from("chat_messages").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }).limit(100),
        supaSvc.from("interview_sessions").select("*").eq("user_id", targetUserId).order("created_at", { ascending: false }),
      ]);

      // Signed URLs for any uploaded user docs
      let documentUrls: Record<string, string> = {};
      try {
        const { data: files } = await supaSvc.storage
          .from("user-documents")
          .list(targetUserId, { limit: 100 });
        if (files?.length) {
          for (const f of files) {
            const { data: signed } = await supaSvc.storage
              .from("user-documents")
              .createSignedUrl(`${targetUserId}/${f.name}`, 60 * 10);
            if (signed?.signedUrl) documentUrls[f.name] = signed.signedUrl;
          }
        }
      } catch (e) {
        console.warn("Storage list failed:", (e as Error).message);
      }

      return json({
        success: true,
        detail: {
          profile,
          factorScores: factorScores || [],
          matches: matches || [],
          outcomes: outcomes || [],
          applications: applications || [],
          deadlines: deadlines || [],
          programs: programs || [],
          documents: documents || [],
          documentUrls,
          chats: chats || [],
          interviews: interviews || [],
        },
      });
    }

    // ── List view ──────────────────────────────────────────────────
    await supaSvc.from("admin_access_log").insert({
      admin_user_id: user.id,
      target_user_id: null,
      table_accessed: "user_list",
      action: "view_list",
      metadata: { search, limit },
    });

    // 1) Authoritative source = auth.users (everyone who signed up).
    const { data: authData, error: authListErr } = await supaSvc.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (authListErr) throw authListErr;
    const authUsers = authData?.users || [];

    // 2) Left-join with profiles by user_id.
    const { data: profiles, error: pErr } = await supaSvc
      .from("profiles")
      .select("user_id, name, email, country, intended_major, gpa, updated_at, created_at");
    if (pErr) throw pErr;

    const profileById = new Map<string, any>();
    for (const p of profiles || []) profileById.set(p.user_id, p);

    let merged = authUsers.map((u) => {
      const p = profileById.get(u.id) || {};
      return {
        user_id: u.id,
        name: p.name ?? null,
        email: p.email ?? u.email ?? null,
        country: p.country ?? null,
        intended_major: p.intended_major ?? null,
        gpa: p.gpa ?? null,
        updated_at: p.updated_at ?? u.updated_at ?? u.created_at ?? null,
        created_at: p.created_at ?? u.created_at ?? null,
        has_profile: !!profileById.get(u.id),
      };
    });

    if (search) {
      merged = merged.filter((p) =>
        [p.name, p.email, p.country, p.intended_major]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(search)),
      );
    }

    // Sort by most recent activity, cap at limit
    merged.sort((a, b) => {
      const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      return tb - ta;
    });
    merged = merged.slice(0, limit);

    const userIds = merged.map((p) => p.user_id);
    const [{ data: scoreRows }, { data: appRows }] = await Promise.all([
      userIds.length
        ? supaSvc
            .from("factor_scores")
            .select("user_id, overall_score, university_name, created_at")
            .in("user_id", userIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as any[] }),
      userIds.length
        ? supaSvc
            .from("user_applications")
            .select("user_id")
            .in("user_id", userIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const latestScoreByUser = new Map<string, { score: number; uni: string }>();
    for (const r of scoreRows || []) {
      if (!latestScoreByUser.has(r.user_id)) {
        latestScoreByUser.set(r.user_id, {
          score: r.overall_score,
          uni: r.university_name,
        });
      }
    }
    const appsByUser = new Map<string, number>();
    for (const a of appRows || []) {
      appsByUser.set(a.user_id, (appsByUser.get(a.user_id) || 0) + 1);
    }

    return json({
      success: true,
      users: merged.map((p) => ({
        ...p,
        latestScore: latestScoreByUser.get(p.user_id)?.score ?? null,
        latestScoreUni: latestScoreByUser.get(p.user_id)?.uni ?? null,
        applicationCount: appsByUser.get(p.user_id) ?? 0,
      })),
      meta: {
        totalAuth: authUsers.length,
        totalProfiles: profiles?.length ?? 0,
        missingProfiles: authUsers.length - (profiles?.length ?? 0),
      },
    });
  } catch (err) {
    console.error("admin-list-users error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
