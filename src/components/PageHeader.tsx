// Premium, consistent page header for inner pages — Linear/Vercel feel.
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  eyebrow?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon: Icon, eyebrow, actions }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className="mb-6"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        {Icon && (
          <div className="hidden sm:flex w-11 h-11 rounded-2xl items-center justify-center shrink-0 surface-premium">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="text-2xl md:text-[28px] font-display font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
    <div className="hairline-glow mt-5" />
  </motion.div>
);
