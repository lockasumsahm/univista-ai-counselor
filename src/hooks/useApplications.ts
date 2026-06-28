import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category: "documents" | "essays" | "tests" | "financial" | "misc";
}

export interface UniversityApplication {
  id: string;
  universityName: string;
  deadline: string;
  checklist: ChecklistItem[];
  notes: string;
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, "id">[] = [
  { label: "Common App / Coalition App submitted", completed: false, category: "documents" },
  { label: "Official transcript requested", completed: false, category: "documents" },
  { label: "SAT/ACT scores sent", completed: false, category: "tests" },
  { label: "AP/IB scores sent (if applicable)", completed: false, category: "tests" },
  { label: "Personal statement completed", completed: false, category: "essays" },
  { label: "Supplemental essays completed", completed: false, category: "essays" },
  { label: "Letters of recommendation requested", completed: false, category: "documents" },
  { label: "FAFSA submitted", completed: false, category: "financial" },
  { label: "CSS Profile submitted", completed: false, category: "financial" },
  { label: "Application fee paid/waiver applied", completed: false, category: "financial" },
  { label: "Interview scheduled (if required)", completed: false, category: "misc" },
  { label: "Portfolio submitted (if applicable)", completed: false, category: "misc" },
];

export function useApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("user_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(
        (data || []).map((row: any) => ({
          id: row.id,
          universityName: row.university_name,
          deadline: row.deadline,
          checklist: Array.isArray(row.checklist) ? row.checklist : [],
          notes: row.notes,
        }))
      );
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const addApplication = async (universityName: string) => {
    if (!user || !universityName.trim()) return;
    const checklist = DEFAULT_CHECKLIST.map((item, idx) => ({
      ...item,
      id: `${Date.now()}-${idx}`,
    }));

    const { data, error } = await supabase.from("user_applications").insert({
      user_id: user.id,
      university_name: universityName.trim(),
      deadline: "",
      checklist: checklist as any,
      notes: "",
    }).select().single();

    if (error) {
      toast({ title: "Error", description: "Failed to add application", variant: "destructive" });
      return null;
    }

    const newApp: UniversityApplication = {
      id: data.id,
      universityName: data.university_name,
      deadline: data.deadline,
      checklist: Array.isArray(data.checklist) ? (data.checklist as unknown as ChecklistItem[]) : [],
      notes: data.notes,
    };
    setApplications(prev => [newApp, ...prev]);
    return newApp;
  };

  const updateApplication = async (id: string, updates: { checklist?: ChecklistItem[]; notes?: string }) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { error } = await supabase.from("user_applications").update(dbUpdates).eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to update application", variant: "destructive" });
      return;
    }
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeApplication = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("user_applications").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete application", variant: "destructive" });
      return;
    }
    setApplications(prev => prev.filter(a => a.id !== id));
  };

  return { applications, loading, addApplication, updateApplication, removeApplication, refetch: fetchApplications };
}
