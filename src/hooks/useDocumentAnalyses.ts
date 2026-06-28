import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DocumentAnalysis {
  type: string;
  result: any;
  fileName?: string;
  timestamp: number;
}

const STORAGE_KEY = "univista_document_analyses";

const readLocal = (): DocumentAnalysis[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeLocal = (analyses: DocumentAnalysis[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
  } catch (e) {
    console.error("Failed to persist document analyses locally:", e);
  }
};

export const useDocumentAnalyses = () => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<DocumentAnalysis[]>(() => readLocal());
  const [loading, setLoading] = useState(false);

  // Load from DB whenever user changes
  useEffect(() => {
    if (!user) {
      setAnalyses(readLocal());
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data, error } = await supabase
        .from("document_analyses")
        .select("document_type, result, file_name, updated_at")
        .eq("user_id", user.id);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load document analyses:", error);
        setAnalyses(readLocal());
      } else if (data) {
        const mapped: DocumentAnalysis[] = data.map((row) => ({
          type: row.document_type,
          result: row.result,
          fileName: row.file_name ?? undefined,
          timestamp: new Date(row.updated_at).getTime(),
        }));
        setAnalyses(mapped);
        writeLocal(mapped);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const upsertAnalysis = useCallback(
    async (analysis: DocumentAnalysis) => {
      const next = [...analyses.filter((a) => a.type !== analysis.type), analysis];
      setAnalyses(next);
      writeLocal(next);

      if (user) {
        const { error } = await supabase
          .from("document_analyses")
          .upsert(
            {
              user_id: user.id,
              document_type: analysis.type,
              file_name: analysis.fileName ?? null,
              result: analysis.result,
            },
            { onConflict: "user_id,document_type" }
          );
        if (error) console.error("Failed to save document analysis:", error);
      }

      return next;
    },
    [analyses, user]
  );

  const removeAnalysis = useCallback(
    async (type: string) => {
      const next = analyses.filter((a) => a.type !== type);
      setAnalyses(next);
      writeLocal(next);

      if (user) {
        const { error } = await supabase
          .from("document_analyses")
          .delete()
          .eq("user_id", user.id)
          .eq("document_type", type);
        if (error) console.error("Failed to delete document analysis:", error);
      }

      return next;
    },
    [analyses, user]
  );

  // Backwards-compatible bulk setter (used by older callers)
  const updateAnalyses = useCallback((newAnalyses: DocumentAnalysis[]) => {
    setAnalyses(newAnalyses);
    writeLocal(newAnalyses);
  }, []);

  return { analyses, loading, upsertAnalysis, removeAnalysis, updateAnalyses };
};
