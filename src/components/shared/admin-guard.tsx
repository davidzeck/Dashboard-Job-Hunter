"use client";

/**
 * AdminGuard — client-side gate for admin-only route groups.
 * The backend enforces the real boundary (403); this just keeps non-admins
 * from seeing pages whose every call would fail.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, selectIsAdmin, selectIsAuthenticated } from "@/stores";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useAuthStore(selectIsAdmin);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  React.useEffect(() => {
    // Wait until the session bootstrap has populated the user
    if (isAuthenticated && !isAdmin) {
      router.replace("/overview");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
