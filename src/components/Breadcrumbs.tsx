import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  items: { label: string; path?: string }[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
    <Link to="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
      <Home className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Dashboard</span>
    </Link>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1.5">
        <ChevronRight className="w-3.5 h-3.5" />
        {item.path ? (
          <Link to={item.path} className="hover:text-foreground transition-colors">{item.label}</Link>
        ) : (
          <span className="text-foreground font-medium">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);
