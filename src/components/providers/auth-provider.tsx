"use client";

/**
 * AuthProvider — the single mount point of the useAuth() engine.
 *
 * Responsibilities:
 * - Bootstrap the session on page load (httpOnly cookie → access token)
 * - Keep the proactive refresh + inactivity timers alive app-wide
 * - Hold rendering until bootstrap resolves so protected pages don't fire
 *   API calls with no access token (401 storms) or flash logged-out UI
 */

import * as React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { isPublicRoute } from "@/lib/auth";
import { AppShellSkeleton } from "@/components/shared";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isBootstrapping } = useAuth();
  const pathname = usePathname();

  // Public pages render immediately; app pages show the app-shell skeleton
  // while the (single-round-trip) session bootstrap resolves.
  if (isBootstrapping && !isPublicRoute(pathname ?? "/")) {
    return <AppShellSkeleton />;
  }

  return <>{children}</>;
}
