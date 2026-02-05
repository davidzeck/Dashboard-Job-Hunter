"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores";

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  onClose: () => void;
}

function Toast({ id, type, title, description, duration = 5000, onClose }: ToastProps) {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: "border-success/50 bg-success/10",
    error: "border-destructive/50 bg-destructive/10",
    warning: "border-warning/50 bg-warning/10",
    info: "border-primary/50 bg-primary/10",
  };

  const iconStyles = {
    success: "text-success",
    error: "text-destructive",
    warning: "text-warning",
    info: "text-primary",
  };

  const Icon = icons[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative rounded-lg border p-4 shadow-lg backdrop-blur-sm",
        styles[type]
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconStyles[type])} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
