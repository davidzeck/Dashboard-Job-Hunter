/**
 * Cookie-based token refresh with single-flight deduplication.
 *
 * Lives in its own module (not auth-service) so api-client can use it on 401
 * retries without an import cycle. The refresh token itself is an httpOnly
 * cookie — the browser attaches it; JS never sees it. `X-Client: web` is
 * required by the backend before it reads the cookie (CSRF guard).
 */

import { useAuthStore } from "@/stores";
import type { AuthTokens, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

let refreshPromise: Promise<AuthTokens> | null = null;

async function doRefresh(): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Client": "web",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh session");
  }

  const body: AuthTokens & { user?: User } = await response.json();
  const { user, ...tokens } = body;
  const store = useAuthStore.getState();
  store.updateTokens(tokens);
  // The backend now returns the profile on refresh, so bootstrap needs no
  // follow-up GET /users/me. Keep the profile fresh on every proactive refresh.
  if (user) store.setUser(user);
  return tokens;
}

/**
 * Refresh the access token via the httpOnly refresh cookie.
 * Concurrent callers share one in-flight request.
 */
export async function refreshTokenWithDedup(): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
