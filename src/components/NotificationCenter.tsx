import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { markRouteSeen } from "@/hooks/usePageVisitTracker";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

const fetchNotifications = async (userId: string): Promise<Notification[]> => {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data as Notification[]) || [];
};

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const autoReadTimer = useRef<number | null>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          queryClient.setQueryData<Notification[]>(["notifications", user.id], (old = []) => {
            const incoming = payload.new as Notification;
            // Avoid duplicate rows in cache when the realtime event arrives
            // for an INSERT we already optimistically have.
            if (old.some((n) => n.id === incoming.id)) return old;
            return [incoming, ...old];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          queryClient.setQueryData<Notification[]>(["notifications", user.id], (old = []) =>
            old.map((n) => (n.id === (payload.new as Notification).id ? (payload.new as Notification) : n)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  const markAllRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    queryClient.setQueryData<Notification[]>(["notifications", user.id], (old = []) =>
      old.map((n) => ({ ...n, read: true })),
    );
  }, [user, unreadCount, queryClient]);

  // Auto-mark all read 800ms after opening the popover so the badge clears
  // once the student has actually seen the messages.
  useEffect(() => {
    if (open && unreadCount > 0) {
      autoReadTimer.current = window.setTimeout(() => {
        void markAllRead();
      }, 800);
    }
    return () => {
      if (autoReadTimer.current) {
        clearTimeout(autoReadTimer.current);
        autoReadTimer.current = null;
      }
    };
  }, [open, unreadCount, markAllRead]);

  const typeIcon = (type: string) => {
    switch (type) {
      case "warning": return "⚠️";
      case "success": return "✅";
      case "deadline": return "⏰";
      case "error": return "❌";
      default: return "ℹ️";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl h-9 w-9"
          aria-label={t("notif.title")}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <p className="font-semibold text-sm">{t("notif.title")}</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              {t("notif.markAllRead")}
            </button>
          )}
        </div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">{t("notif.noNotifications")}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {notifications.map((n) => {
                const inner = (
                  <div className="flex items-start gap-2">
                    <span className="text-base mt-0.5 leading-tight">{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground leading-snug line-clamp-2">{n.title}</p>
                      {n.message && (
                        <p className="text-muted-foreground text-xs mt-0.5 leading-snug line-clamp-2">
                          {n.message}
                        </p>
                      )}
                      <p className="text-muted-foreground/60 text-[10px] mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
                const baseCls = `block px-4 py-3 text-sm transition-colors ${n.read ? "opacity-60" : "bg-primary/5"}`;
                if (n.link) {
                  return (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => {
                        // Mark this notification read immediately so it never re-appears as unread.
                        if (!n.read) {
                          queryClient.setQueryData<Notification[]>(["notifications", user!.id], (old = []) =>
                            old.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                          );
                          void supabase.from("notifications").update({ read: true }).eq("id", n.id);
                        }
                        // Record the route as visited so future pushNotification(suppressIfVisited)
                        // calls for the same destination don't nag the user again.
                        if (user?.id && n.link) void markRouteSeen(user.id, n.link);
                        setOpen(false);
                      }}
                      className={`${baseCls} hover:bg-muted/40`}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <div key={n.id} className={baseCls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
