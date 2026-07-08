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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isBootstrapping } = useAuth();
  const pathname = usePathname();

  // Public pages render immediately; app pages wait for the session attempt
  if (isBootstrapping && !isPublicRoute(pathname ?? "/")) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
