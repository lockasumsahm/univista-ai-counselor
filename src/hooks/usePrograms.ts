import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Program {
  id: string;
  university: string;
  program: string;
  deadline: string;
  status: "researching" | "preparing" | "submitted" | "accepted" | "rejected" | "waitlisted";
  priority: "reach" | "match" | "safety";
  country: string;
  tuition: string;
  notes: string;
  checklist: { label: string; done: boolean }[];
}

const DEFAULT_CHECKLIST = [
  { label: "Research program requirements", done: false },
  { label: "Request transcripts", done: false },
  { label: "Write personal statement", done: false },
  { label: "Get recommendation letters", done: false },
  { label: "Complete application form", done: false },
  { label: "Pay application fee", done: false },
  { label: "Submit application", done: false },
];

export function usePrograms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_programs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrograms(
        (data || []).map((row: any) => ({
          id: row.id,
          university: row.university,
          program: row.program,
          deadline: row.deadline,
          status: row.status,
          priority: row.priority,
          country: row.country,
          tuition: row.tuition,
          notes: row.notes,
          checklist: Array.isArray(row.checklist) ? row.checklist : [],
        }))
      );
    } catch (err) {
      console.error("Error fetching programs:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchPrograms(); }, [fetchPrograms]);

  const addProgram = async (newProg: Omit<Program, "id" | "status" | "notes" | "checklist">) => {
    if (!user) return;
    const { data, error } = await supabase.from("user_programs").insert({
      user_id: user.id,
      university: newProg.university,
      program: newProg.program,
      deadline: newProg.deadline,
      status: "researching",
      priority: newProg.priority,
      country: newProg.country,
      tuition: newProg.tuition,
      notes: "",
      checklist: DEFAULT_CHECKLIST,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: "Failed to add program", variant: "destructive" });
      return;
    }

    setPrograms(prev => [{
      id: data.id,
      university: data.university,
      program: data.program,
      deadline: data.deadline,
      status: data.status as Program["status"],
      priority: data.priority as Program["priority"],
      country: data.country,
      tuition: data.tuition,
      notes: data.notes,
      checklist: Array.isArray(data.checklist) ? data.checklist as { label: string; done: boolean }[] : [],
    }, ...prev]);
  };

  const updateProgram = async (id: string, updates: Partial<Program>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from("user_programs").update(dbUpdates).eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update program", variant: "destructive" });
      return;
    }
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removeProgram = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("user_programs").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete program", variant: "destructive" });
      return;
    }
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  return { programs, loading, addProgram, updateProgram, removeProgram, refetch: fetchPrograms };
}
