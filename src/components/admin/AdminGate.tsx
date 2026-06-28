import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

/**
 * AdminGate — renders children only for users whose `user_roles` row
 * has `role = 'admin'`. Non-admins now see an explicit access-denied panel
 * instead of being silently redirected (so they understand why).
 *
 * The real security gate is the `is_admin()` RLS policies on the database
 * and the edge function check — this is just UI.
 */
export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="border-destructive/30">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold mb-1">Access denied</h2>
              <p className="text-sm text-muted-foreground">
                Your account is not an admin. The Admin Console is owner-only.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
