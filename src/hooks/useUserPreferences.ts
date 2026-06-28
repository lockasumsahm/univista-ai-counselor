import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPreferences {
  email_notifications: boolean;
  deadline_reminders: boolean;
}

const DEFAULTS: UserPreferences = {
  email_notifications: true,
  deadline_reminders: true,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("user_preferences")
        .select("email_notifications, deadline_reminders")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled && data) setPrefs(data as UserPreferences);
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const update = useCallback(async (patch: Partial<UserPreferences>) => {
    if (!user) return { error: new Error("Not signed in") };
    const next = { ...prefs, ...patch };
    setPrefs(next);
    setSaving(true);
    const { error } = await supabase
      .from("user_preferences")
      .upsert({ user_id: user.id, ...next }, { onConflict: "user_id" });
    setSaving(false);
    return { error };
  }, [user, prefs]);

  return { prefs, update, loading, saving };
}
