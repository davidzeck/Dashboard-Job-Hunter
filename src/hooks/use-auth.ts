/**
 * Auth Hook - Handles authentication state and token refresh
 *
 * v2 model: access token in memory only; refresh token in an httpOnly cookie.
 * On a full page load the store has no tokens — bootstrapSession() exchanges
 * the cookie for a fresh access token and re-fetches the profile.
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authService } from "@/services/auth-service";
import { isDemoMode } from "@/services/mock-api-service";
import { isPublicRoute } from "@/lib/auth";

// Refresh tokens 5 minutes before expiry
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Check session every minute
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Hook to manage authentication state and automatic token refresh.
 * Mount ONCE via <AuthProvider> — it is the engine, not a per-component hook.
 */
export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const bootstrapStartedRef = useRef(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    isRefreshing,
    sessionExpiry,
    login,
    logout,
    updateTokens,
    setUser,
    updateActivity,
    checkSession,
    setRefreshing,
  } = useAuthStore();

  /**
   * Refresh the access token (via the httpOnly cookie)
   */
  const refreshToken = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setRefreshing(true);
      const newTokens = await authService.refreshToken();
      updateTokens(newTokens);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      router.push("/login?expired=true");
    } finally {
      setRefreshing(false);
    }
  }, [isRefreshing, setRefreshing, updateTokens, logout, router]);

  /**
   * Bootstrap after a full page load: cookie → access token → profile.
   * Runs exactly once per app mount.
   */
  useEffect(() => {
    if (bootstrapStartedRef.current) return;
    bootstrapStartedRef.current = true;

    const bootstrap = async () => {
      // Demo mode or an in-memory session (client-side nav) needs no bootstrap
      if (isDemoMode() || useAuthStore.getState().tokens?.access_token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        // /auth/refresh now returns the profile too (applied by token-refresh),
        // so a single round-trip bootstraps the session. Fall back to /users/me
        // only if the user somehow wasn't included.
        await authService.refreshToken();
        if (!useAuthStore.getState().user) {
          setUser(await authService.getCurrentUser());
        }
        useAuthStore.getState().updateActivity();
      } catch {
        // No/invalid cookie — treat as logged out
        logout();
        if (!isPublicRoute(pathname ?? "/")) {
          router.push("/login?expired=true");
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    // Nothing to restore on public pages without a session attempt cost —
    // still try silently so "remember me" users land logged in.
    void bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Schedule token refresh
   */
  const scheduleRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    if (!sessionExpiry || !isAuthenticated) return;

    const timeUntilRefresh = sessionExpiry - Date.now() - REFRESH_THRESHOLD_MS;

    if (timeUntilRefresh <= 0) {
      // Token needs immediate refresh
      refreshToken();
    } else {
      // Schedule refresh
      refreshTimeoutRef.current = setTimeout(refreshToken, timeUntilRefresh);
    }
  }, [sessionExpiry, isAuthenticated, refreshToken]);

  /**
   * Handle user activity
   */
  const handleActivity = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  /**
   * Logout handler
   */
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      router.push("/login");
    }
  }, [logout, router]);

  // Setup token refresh scheduling
  useEffect(() => {
    if (isAuthenticated) {
      scheduleRefresh();
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated, scheduleRefresh]);

  // Setup session check interval
  useEffect(() => {
    if (isAuthenticated) {
      sessionCheckRef.current = setInterval(() => {
        const isValid = checkSession();
        if (!isValid) {
          router.push("/login?expired=true");
        }
      }, SESSION_CHECK_INTERVAL_MS);
    }

    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [isAuthenticated, checkSession, router]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];

    // Throttle activity updates to once per minute
    let lastUpdate = Date.now();
    const throttledActivity = () => {
      if (Date.now() - lastUpdate > 60000) {
        handleActivity();
        lastUpdate = Date.now();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, throttledActivity);
      });
    };
  }, [isAuthenticated, handleActivity]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    isRefreshing,
    isBootstrapping,
    login,
    logout: handleLogout,
    refreshToken,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo = "/login") {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to redirect if already authenticated
 * Useful for login/register pages
 */
export function useRedirectIfAuthenticated(redirectTo = "/overview") {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}
