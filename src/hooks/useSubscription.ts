import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPaddleEnvironment } from "@/lib/paddle";

export type Tier = "free" | "pro" | "premium";

export interface SubscriptionInfo {
  tier: Tier;
  isActive: boolean;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  productId: string | null;
  priceId: string | null;
}

const FREE: SubscriptionInfo = {
  tier: "free",
  isActive: false,
  status: null,
  cancelAtPeriodEnd: false,
  currentPeriodEnd: null,
  productId: null,
  priceId: null,
};

export function useSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const env = getPaddleEnvironment();

  const query = useQuery({
    queryKey: ["subscription", user?.id, env],
    enabled: !!user,
    queryFn: async (): Promise<SubscriptionInfo> => {
      if (!user) return FREE;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("environment", env)
        .maybeSingle();
      if (error || !data) return FREE;

      const isActive =
        ["active", "trialing"].includes(data.status) &&
        (!data.current_period_end || new Date(data.current_period_end) > new Date());

      const tier: Tier =
        data.product_id === "premium_plan" ? "premium" :
        data.product_id === "pro_plan" ? "pro" : "free";

      return {
        tier: isActive ? tier : "free",
        isActive,
        status: data.status,
        cancelAtPeriodEnd: !!data.cancel_at_period_end,
        currentPeriodEnd: data.current_period_end,
        productId: data.product_id,
        priceId: data.price_id,
      };
    },
    staleTime: 30_000,
  });

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["subscription", user.id, env] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, env, queryClient]);

  const sub = query.data ?? FREE;

  const hasPro = sub.isActive && (sub.tier === "pro" || sub.tier === "premium");
  const hasPremium = sub.isActive && sub.tier === "premium";

  return { ...sub, loading: query.isLoading, hasPro, hasPremium, refetch: query.refetch };
}

export function useCustomerPortal() {
  const [loading, setLoading] = useState(false);
  const open = async () => {
    setLoading(true);
    try {
      const env = getPaddleEnvironment();
      const { data, error } = await supabase.functions.invoke("customer-portal", { body: { environment: env } });
      if (error || !data?.url) throw new Error(error?.message ?? "No portal URL");
      window.open(data.url, "_blank");
    } finally {
      setLoading(false);
    }
  };
  return { open, loading };
}
