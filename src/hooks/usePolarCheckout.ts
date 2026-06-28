import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

async function getCheckoutErrorMessage(error: any) {
  const fallback = error?.message ?? "Please try again in a moment.";
  const context = error?.context;
  if (context && typeof context.clone === "function") {
    try {
      const body = await context.clone().json();
      return body?.error || body?.message || body?.details?.detail || fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function usePolarCheckout() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const openCheckout = async () => {
    setLoading(true);
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in before purchasing.");

      const { data, error } = await supabase.functions.invoke("polar-checkout", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw new Error(await getCheckoutErrorMessage(error));
      const url = (data as { url?: string } | null)?.url;
      if (!url) throw new Error("No checkout URL returned.");

      if (popup) popup.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
      return true;
    } catch (error: any) {
      popup?.close();
      toast({
        title: "Couldn't open checkout",
        description: error?.message ?? "Please try again in a moment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
