import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Polar checkout (handled via edge function)
export const LEMONSQUEEZY_LINK = "";
// Backwards-compatible aliases (older imports)
export const PAYONEER_LINK = LEMONSQUEEZY_LINK;
export const GUMROAD_LINK = LEMONSQUEEZY_LINK;
export const PASS_PRICE_CAD = 15;

export type PaymentReviewStatus = "pending" | "approved" | "rejected";

export interface PaymentReviewRequest {
  id: string;
  payment_reference: string;
  payer_email: string | null;
  amount_cad: number;
  status: PaymentReviewStatus;
  admin_notes: string | null;
  created_at: string;
}

export function usePremiumPass() {
  const { user } = useAuth();
  const [hasPass, setHasPass] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latestReview, setLatestReview] = useState<PaymentReviewRequest | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setHasPass(false);
      setLatestReview(null);
      setLoading(false);
      return;
    }
    const [{ data: pass }, { data: review }] = await Promise.all([
      supabase
        .from("premium_passes")
        .select("active")
        .eq("user_id", user.id)
        .eq("active", true)
        .maybeSingle(),
      supabase
        .from("payment_review_requests")
        .select("id,payment_reference,payer_email,amount_cad,status,admin_notes,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    setHasPass(!!pass?.active);
    setLatestReview((review as PaymentReviewRequest | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitPaymentReview = async (paymentReference: string, payerEmail?: string) => {
    if (!user) return { error: new Error("Not signed in") };
    const reference = paymentReference.trim();
    if (reference.length < 4) return { error: new Error("Enter a valid payment reference") };

    const { error } = await supabase
      .from("payment_review_requests")
      .insert({
        user_id: user.id,
        payment_reference: reference,
        payer_email: payerEmail?.trim() || user.email || null,
        amount_cad: PASS_PRICE_CAD,
        status: "pending",
      });
    if (!error) await refresh();
    return { error };
  };

  return { hasPass, loading, latestReview, submitPaymentReview, refresh };
}
