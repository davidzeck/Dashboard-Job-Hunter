"use client";

/**
 * Daily AI quota banner.
 *
 * - Nearing the limit (warn): amber heads-up with remaining count.
 * - Limit reached (exhausted): red notice — top up or wait for the reset —
 *   callers should also disable their AI action buttons.
 * - Otherwise renders nothing.
 */

import { AlertTriangle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiUsage } from "@/services/cv-service";

function resetsLabel(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "tomorrow";
  const hours = Math.ceil(seconds / 3600);
  return hours <= 1 ? "in under an hour" : `in about ${hours} hours`;
}

export function AiUsageBanner({
  usage,
  className,
}: {
  usage: AiUsage | undefined;
  className?: string;
}) {
  if (!usage || (!usage.warn && !usage.exhausted)) return null;

  if (usage.exhausted) {
    return (
      <div
        className={cn(
          "flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm",
          className
        )}
      >
        <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Daily AI limit reached</p>
          <p className="text-muted-foreground">
            You&apos;ve used all {usage.limit} AI analyses for today. Top up
            your plan to raise the limit, or the quota resets{" "}
            {resetsLabel(usage.resets_in_seconds)}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm",
        className
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
      <div>
        <p className="font-medium text-yellow-600 dark:text-yellow-500">
          Nearing your daily AI limit
        </p>
        <p className="text-muted-foreground">
          {usage.remaining} of {usage.limit} AI analyses left today. The quota
          resets {resetsLabel(usage.resets_in_seconds)}.
        </p>
      </div>
    </div>
  );
}
