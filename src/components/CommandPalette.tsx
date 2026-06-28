import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import {
  Home, BarChart3, GraduationCap, School, Search, Upload, Map, Clock,
  Award, BookOpen, FileCheck, Mic, TrendingUp, Plane, FileDown,
  MessageCircle, Edit, Settings, LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const pages = [
  { path: "/dashboard", labelKey: "sidebar.dashboard", icon: Home },
  { path: "/dashboard/results", labelKey: "sidebar.profileScore", icon: BarChart3 },
  { path: "/dashboard/matches", labelKey: "sidebar.uniMatches", icon: GraduationCap },
  { path: "/dashboard/checker", labelKey: "sidebar.uniChecker", icon: School },
  { path: "/dashboard/compare", labelKey: "sidebar.compare", icon: Search },
  { path: "/dashboard/documents", labelKey: "sidebar.documents", icon: Upload },
  { path: "/dashboard/roadmap", labelKey: "sidebar.roadmap", icon: Map },
  { path: "/dashboard/deadlines", labelKey: "sidebar.deadlines", icon: Clock },
  { path: "/dashboard/scholarships", labelKey: "sidebar.scholarships", icon: Award },
  { path: "/dashboard/essay-coach", labelKey: "sidebar.essayCoach", icon: BookOpen },
  { path: "/dashboard/essay-upload", labelKey: "sidebar.essayAI", icon: FileCheck },
  { path: "/dashboard/interview", labelKey: "sidebar.interview", icon: Mic },
  { path: "/dashboard/doc-optimizer", labelKey: "sidebar.docOptimizer", icon: FileCheck },
  { path: "/dashboard/programs", labelKey: "sidebar.programs", icon: TrendingUp },
  { path: "/dashboard/visa-guide", labelKey: "sidebar.visaGuide", icon: Plane },
  { path: "/dashboard/export", labelKey: "sidebar.export", icon: FileDown },
  { path: "/dashboard/chat", labelKey: "sidebar.aiChat", icon: MessageCircle },
  { path: "/dashboard/profile", labelKey: "sidebar.editProfile", icon: Edit },
  { path: "/dashboard/settings", labelKey: "sidebar.settings", icon: Settings },
];

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runAction = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t('cmd.searchPlaceholder')} />
      <CommandList>
        <CommandEmpty>{t('cmd.noResults')}</CommandEmpty>
        <CommandGroup heading={t('cmd.pages')}>
          {pages.map(({ path, labelKey, icon: Icon }) => (
            <CommandItem key={path} onSelect={() => runAction(path)} className="gap-3 cursor-pointer">
              <Icon className="w-4 h-4 text-muted-foreground" />
              {t(labelKey)}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading={t('cmd.actions')}>
          <CommandItem onSelect={() => { setOpen(false); signOut(); }} className="gap-3 cursor-pointer text-destructive">
            <LogOut className="w-4 h-4" />
            {t('cmd.signOut')}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
