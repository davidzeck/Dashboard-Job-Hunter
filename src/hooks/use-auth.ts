/**
 * Auth Hook - Handles authentication state and token refresh
 */

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { authService, refreshTokenWithDedup } from "@/services/auth-service";

// Refresh tokens 5 minutes before expiry
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Check session every minute
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

/**
 * Hook to manage authentication state and automatic token refresh
 */
export function useAuth() {
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

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
    updateActivity,
    checkSession,
    setRefreshing,
    setError,
  } = useAuthStore();

  /**
   * Refresh the access token
   */
  const refreshToken = useCallback(async () => {
    if (!tokens?.refresh_token || isRefreshing) return;

    try {
      setRefreshing(true);
      const newTokens = await refreshTokenWithDedup(tokens.refresh_token);
      updateTokens(newTokens);
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      router.push("/login?expired=true");
    }
  }, [tokens?.refresh_token, isRefreshing, setRefreshing, updateTokens, logout, router]);

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
