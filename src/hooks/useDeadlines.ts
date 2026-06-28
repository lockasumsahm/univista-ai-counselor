import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Deadline {
  id: string;
  university: string;
  type: "early-decision" | "early-action" | "regular" | "financial-aid" | "scholarship" | "test" | "custom";
  date: string;
  notes: string;
  completed: boolean;
  reminder: boolean;
  reminderDays: number[];
}

export function useDeadlines() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeadlines = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_deadlines")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (error) throw error;
      setDeadlines(
        (data || []).map((row: any) => ({
          id: row.id,
          university: row.university,
          type: row.type as Deadline["type"],
          date: row.date,
          notes: row.notes,
          completed: row.completed,
          reminder: row.reminder,
          reminderDays: Array.isArray(row.reminder_days) ? row.reminder_days : [7, 3, 1],
        }))
      );
    } catch (err) {
      console.error("Error fetching deadlines:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchDeadlines(); }, [fetchDeadlines]);

  const addDeadline = async (dl: Omit<Deadline, "id">) => {
    if (!user) return;
    const { data, error } = await supabase.from("user_deadlines").insert({
      user_id: user.id,
      university: dl.university,
      type: dl.type,
      date: dl.date,
      notes: dl.notes,
      completed: dl.completed,
      reminder: dl.reminder,
      reminder_days: dl.reminderDays,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: "Failed to add deadline", variant: "destructive" });
      return;
    }

    setDeadlines(prev => [...prev, {
      id: data.id,
      university: data.university,
      type: data.type as Deadline["type"],
      date: data.date,
      notes: data.notes,
      completed: data.completed,
      reminder: data.reminder,
      reminderDays: Array.isArray(data.reminder_days) ? data.reminder_days as number[] : [7, 3, 1],
    }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const updateDeadline = async (id: string, updates: Partial<Deadline>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.reminder !== undefined) dbUpdates.reminder = updates.reminder;
    if (updates.reminderDays !== undefined) dbUpdates.reminder_days = updates.reminderDays;

    const { error } = await supabase.from("user_deadlines").update(dbUpdates).eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update deadline", variant: "destructive" });
      return;
    }
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const removeDeadline = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("user_deadlines").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete deadline", variant: "destructive" });
      return;
    }
    setDeadlines(prev => prev.filter(d => d.id !== id));
  };

  const addMultipleDeadlines = async (dls: Omit<Deadline, "id">[]) => {
    if (!user || dls.length === 0) return;
    const rows = dls.map(dl => ({
      user_id: user.id,
      university: dl.university,
      type: dl.type,
      date: dl.date,
      notes: dl.notes,
      completed: dl.completed,
      reminder: dl.reminder,
      reminder_days: dl.reminderDays,
    }));

    const { data, error } = await supabase.from("user_deadlines").insert(rows).select();
    if (error) {
      toast({ title: "Error", description: "Failed to add deadlines", variant: "destructive" });
      return;
    }

    const newDeadlines = (data || []).map((row: any) => ({
      id: row.id,
      university: row.university,
      type: row.type as Deadline["type"],
      date: row.date,
      notes: row.notes,
      completed: row.completed,
      reminder: row.reminder,
      reminderDays: Array.isArray(row.reminder_days) ? row.reminder_days as number[] : [7, 3, 1],
    }));

    setDeadlines(prev => [...prev, ...newDeadlines].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  return { deadlines, loading, addDeadline, updateDeadline, removeDeadline, addMultipleDeadlines, refetch: fetchDeadlines };
}
