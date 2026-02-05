"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

export type ViewMode = "grid" | "list" | "table";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

const views: Array<{ mode: ViewMode; icon: React.ElementType; label: string }> = [
  { mode: "grid", icon: LayoutGrid, label: "Grid view" },
  { mode: "list", icon: List, label: "List view" },
  { mode: "table", icon: Table2, label: "Table view" },
];

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border bg-muted/50 p-1",
        className
      )}
    >
      {views.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          title={label}
          className={cn(
            "relative inline-flex items-center justify-center rounded-md px-3 py-1.5",
            "text-sm font-medium transition-colors",
            "hover:bg-muted",
            value === mode && "bg-background text-foreground shadow-sm"
          )}
        >
          {value === mode && (
            <motion.span
              layoutId="view-toggle-indicator"
              className="absolute inset-0 rounded-md bg-background shadow-sm"
              transition={{ type: "spring", duration: 0.3 }}
            />
          )}
          <Icon className="h-4 w-4 relative z-10" />
        </button>
      ))}
    </div>
  );
}

// Compact version for mobile
export function ViewToggleCompact({ value, onChange, className }: ViewToggleProps) {
  const currentView = views.find((v) => v.mode === value);
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(!open)}
      >
        {currentView && <currentView.icon className="h-4 w-4" />}
        {currentView?.label}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-32 rounded-md border bg-popover shadow-lg z-20">
            {views.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent",
                  value === mode && "bg-accent"
                )}
                onClick={() => {
                  onChange(mode);
                  setOpen(false);
                }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
