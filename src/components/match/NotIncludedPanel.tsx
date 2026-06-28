import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  items: { name: string; reason: string }[];
}

export const NotIncludedPanel = ({ items }: Props) => {
  const [open, setOpen] = useState(false);
  if (!items?.length) return null;

  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="p-5">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="w-full flex items-center justify-between text-left">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {items.length} universit{items.length === 1 ? "y" : "ies"} not included due to missing verified data
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  We only include universities with published median GPA, test scores, and acceptance rates so estimates stay honest.
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 text-sm py-1 border-b border-border/30 last:border-0">
                  <span className="text-foreground font-medium">{it.name}</span>
                  <span className="text-muted-foreground text-right text-xs">{it.reason}</span>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
