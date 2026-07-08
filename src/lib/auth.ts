/**
 * Authentication Utilities
 *
 * Token storage model (v2): the access token lives ONLY in the auth store
 * (memory); the refresh token is an httpOnly cookie owned by the backend.
 * There are deliberately no localStorage/sessionStorage token helpers here —
 * persisting tokens in web storage made them XSS-stealable.
 */

/**
 * Parse JWT token to get payload (without verification)
 */
export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Routes that should redirect to dashboard if already authenticated
export const AUTH_ROUTES = ["/login", "/register"];

/**
 * Check if a path is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Check if a path is an auth route (login/register)
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
