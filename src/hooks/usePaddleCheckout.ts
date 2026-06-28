import { useState } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function usePaddleCheckout() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const openCheckout = async (priceId: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to subscribe.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await initializePaddle();
      const paddlePriceId = await getPaddlePriceId(priceId);

      window.Paddle.Checkout.open({
        items: [{ priceId: paddlePriceId, quantity: 1 }],
        customer: user.email ? { email: user.email } : undefined,
        customData: { userId: user.id },
        settings: {
          displayMode: "overlay",
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          allowLogout: false,
          variant: "one-page",
        },
      });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Checkout error", description: e.message ?? "Could not open checkout.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return { openCheckout, loading };
}
