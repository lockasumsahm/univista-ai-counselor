import { Button } from "@/components/ui/button";
import { FileText, School, Map, Award, MessageCircle, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  onAnalyzeCV: () => void;
  onUniversityMatch: () => void;
  onRoadmap: () => void;
  onEssayScholarship: () => void;
  onChatbot: () => void;
  loading: boolean;
}

export const ActionButtons = ({
  onAnalyzeCV,
  onUniversityMatch,
  onRoadmap,
  onEssayScholarship,
  onChatbot,
  loading,
}: ActionButtonsProps) => {
  const { t } = useLanguage();
  
  const actions = [
    { onClick: onAnalyzeCV, icon: FileText, label: t('action.analyzeCV'), description: "AI-powered CV review", color: "primary" as const },
    { onClick: onUniversityMatch, icon: School, label: t('action.matchUniversities'), description: "Find your best fit", color: "primary" as const },
    { onClick: onRoadmap, icon: Map, label: t('action.generateRoadmap'), description: "12-month action plan", color: "primary" as const },
    { onClick: onEssayScholarship, icon: Award, label: t('nav.essays'), description: "Essay & scholarship tips", color: "accent" as const },
    { onClick: onChatbot, icon: MessageCircle, label: t('nav.chat'), description: "Ask your AI counselor", color: "accent" as const },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {actions.map((action, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className={i === 4 ? "col-span-2 md:col-span-1" : ""}
        >
          <ActionButton {...action} disabled={loading} />
        </motion.div>
      ))}
    </div>
  );
};

const ActionButton = ({ onClick, disabled, icon: Icon, label, description, color }: {
  onClick: () => void; disabled: boolean; icon: typeof FileText; label: string; description: string; color: 'primary' | 'accent';
}) => {
  const bg = color === 'primary' ? 'bg-gradient-primary hover:shadow-glow' : 'bg-gradient-accent hover:shadow-accent';
  
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`h-auto py-5 w-full flex flex-col items-center gap-2 font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] rounded-2xl ${bg} text-primary-foreground relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      <div className="relative flex flex-col items-center gap-1.5 text-center">
        <div className="group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm leading-tight">{label}</span>
        <span className="text-[10px] opacity-70 leading-tight hidden sm:block">{description}</span>
      </div>
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/80 backdrop-blur-sm">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
      )}
    </Button>
  );
};
