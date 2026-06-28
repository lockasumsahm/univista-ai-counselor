import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return false;
    // Default to bright/light theme everywhere — only honor an explicit user opt-in.
    return localStorage.getItem("univista-theme") === "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("univista-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("univista-theme", "light");
    }
  }, [isDark]);

  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsDark(!isDark)}
      className="rounded-xl h-9 w-9"
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
    </Button>
  );
};
