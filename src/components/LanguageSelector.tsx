import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage, Language, languageNames } from "@/contexts/LanguageContext";

const languageFlags: Record<Language, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  zh: '🇨🇳',
  hi: '🇮🇳',
  ar: '🇸🇦',
  fr: '🇫🇷',
  pt: '🇧🇷',
};

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger aria-label={`Select language, current: ${languageNames[language]}`} className="w-auto min-w-0 gap-1 bg-card/80 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-all duration-200 px-2 py-1.5 h-9 [&>span:last-child]:hidden md:[&>span:last-child]:inline">
        <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-sm">{languageFlags[language]}</span>
      </SelectTrigger>
      <SelectContent className="bg-card/95 backdrop-blur-md border-border/50 shadow-lg">
        {(Object.entries(languageNames) as [Language, string][]).map(([code, name]) => (
          <SelectItem 
            key={code} 
            value={code}
            className="cursor-pointer hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{languageFlags[code]}</span>
              <span>{name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
