import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProfile } from "@/hooks/useProfile";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { CommandPalette } from "@/components/CommandPalette";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { NotificationCenter } from "@/components/NotificationCenter";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import logo from "@/assets/logo.webp";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import {
  LogOut, User, BarChart3, School, Map, Award, MessageCircle,
  BookOpen, Upload, Mic, FileCheck, Users, LayoutDashboard, Clock,
  Search, TrendingUp, Edit, Menu, X, ChevronLeft, Home, ImageIcon,
  GraduationCap, Plane, FileDown, Settings, Command, Target, Compass, Shield, Brain
} from "lucide-react";
import { prefetchRoute } from "@/lib/routePrefetch";
import { usePageVisitTracker } from "@/hooks/usePageVisitTracker";

interface NavSection {
  label: string;
  emoji: string;
  items: { path: string; labelKey: string; icon: any }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Start Your Journey",
    emoji: "🧭",
    items: [
      { path: "/dashboard", labelKey: "sidebar.dashboard", icon: Home },
      { path: "/dashboard/fitmatrix", labelKey: "sidebar.fitMatrix", icon: Target },
      { path: "/dashboard/results", labelKey: "sidebar.profileScore", icon: BarChart3 },
      { path: "/dashboard/matches", labelKey: "sidebar.uniMatches", icon: GraduationCap },
      { path: "/dashboard/checker", labelKey: "sidebar.uniChecker", icon: School },
      { path: "/dashboard/admitiq", labelKey: "AdmitIQ", icon: Brain },
      { path: "/dashboard/roadmap", labelKey: "sidebar.roadmap", icon: Map },
    ],
  },
  {
    label: "Applications",
    emoji: "📝",
    items: [
      { path: "/dashboard/documents", labelKey: "sidebar.documents", icon: Upload },
      { path: "/dashboard/essay-coach", labelKey: "sidebar.essayCoach", icon: BookOpen },
      { path: "/dashboard/essay-upload", labelKey: "sidebar.essayAI", icon: FileCheck },
      { path: "/dashboard/interview", labelKey: "sidebar.interview", icon: Mic },
      { path: "/dashboard/doc-optimizer", labelKey: "sidebar.docOptimizer", icon: FileCheck },
    ],
  },
  {
    label: "Study Abroad",
    emoji: "🌍",
    items: [
      { path: "/dashboard/visa-guide", labelKey: "sidebar.visaGuide", icon: Plane },
      { path: "/dashboard/scholarships", labelKey: "sidebar.scholarships", icon: Award },
      { path: "/dashboard/deadlines", labelKey: "sidebar.deadlines", icon: Clock },
      { path: "/dashboard/programs", labelKey: "sidebar.programs", icon: TrendingUp },
    ],
  },
  {
    label: "Tools",
    emoji: "⚡",
    items: [
      { path: "/dashboard/compare", labelKey: "sidebar.compare", icon: Search },
      { path: "/dashboard/chat", labelKey: "sidebar.aiChat", icon: MessageCircle },
      { path: "/dashboard/export", labelKey: "sidebar.export", icon: FileDown },
    ],
  },
  {
    label: "Community",
    emoji: "💬",
    items: [
      { path: "/dashboard/community", labelKey: "sidebar.community", icon: Users },
      { path: "/dashboard/feedback", labelKey: "sidebar.feedback", icon: MessageCircle },
    ],
  },
];

const NavItems = ({ location, t, onClick }: { location: any; t: (k: string) => string; onClick?: () => void }) => (
  <>
    {NAV_SECTIONS.map((section) => (
      <div key={section.label} className="mb-1">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <span>{section.emoji}</span>
          <span>{section.label}</span>
        </div>
        {section.items.map(({ path, labelKey, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onClick}
              onMouseEnter={() => prefetchRoute(path)}
              onFocus={() => prefetchRoute(path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-foreground" : "group-hover:text-foreground"}`} />
              {t(labelKey)}
            </Link>
          );
        })}
      </div>
    ))}
  </>
);

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { profile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  usePageVisitTracker();

  const displayName = profile?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    toast({ title: t('auth.signOutSuccess') });
    navigate("/");
  };

  const { isAdmin } = useIsAdmin();

  const BottomActions = ({ onClick }: { onClick?: () => void }) => (
    <div className="p-3 border-t border-border/30 space-y-1">
      {isAdmin && (
        <Link
          to="/dashboard/admin"
          onClick={onClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            location.pathname === "/dashboard/admin"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Shield className="w-4 h-4" />
          Admin
        </Link>
      )}
      <Link
        to="/dashboard/settings"
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          location.pathname === "/dashboard/settings"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <Settings className="w-4 h-4" />
        {t('sidebar.settings')}
      </Link>
      <Link
        to="/dashboard/profile"
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
      >
        <Edit className="w-4 h-4" />
        {t('sidebar.editProfile')}
      </Link>
      <button
        onClick={() => { onClick?.(); handleSignOut(); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all w-full"
      >
        <LogOut className="w-4 h-4" />
        {t('sidebar.signOut')}
      </button>
    </div>
  );

  return (
    <>
    <PaymentTestModeBanner />
    <div className="min-h-screen bg-background flex">
      <CommandPalette />
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/40 bg-card/50 backdrop-blur-xl fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-border/30">
          <motion.img
            src={logo}
            alt="UniVista.AI"
            className="w-9 h-9 object-contain"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className="font-display font-bold text-lg tracking-tight">
            <span className="text-primary">UniVista</span>
            <span className="text-accent">.AI</span>
          </span>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-border/20">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav role="navigation" aria-label="Dashboard navigation" className="flex-1 overflow-y-auto py-2 px-3 scrollbar-none">
          <NavItems location={location} t={t} />
        </nav>

        <BottomActions />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 border-r border-border/40 bg-card z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="UniVista.AI" className="w-8 h-8 object-contain" />
                  <span className="font-display font-bold">
                    <span className="text-primary">UniVista</span>
                    <span className="text-accent">.AI</span>
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <nav role="navigation" aria-label="Dashboard navigation" className="flex-1 overflow-y-auto py-2 px-3">
                <NavItems location={location} t={t} onClick={() => setSidebarOpen(false)} />
              </nav>
              <BottomActions onClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-14 px-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-xl" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="UniVista.AI" className="w-7 h-7 object-contain" />
              <span className="font-display font-bold text-sm">
                <span className="text-primary">UniVista</span>
                <span className="text-accent">.AI</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <NotificationCenter />
              <LanguageSelector />
            </div>
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl items-center justify-between h-14 px-6">
          <button onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/40 bg-muted/30 text-muted-foreground text-sm hover:bg-muted/50 transition-colors">
            <Search className="w-3.5 h-3.5" />
            <span>{t('sidebar.search')}</span>
            <kbd className="ml-4 text-xs bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <DarkModeToggle />
            <LanguageSelector />
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden" tabIndex={-1}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-lg"
          >
            Skip to main content
          </a>
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
    </>
  );
};
