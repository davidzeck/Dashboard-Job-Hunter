/**
 * Authentication Utilities
 * Handles token management, validation, and session persistence
 */

import { AuthTokens } from "@/types";

// Token storage keys
const ACCESS_TOKEN_KEY = "jobscout_access_token";
const REFRESH_TOKEN_KEY = "jobscout_refresh_token";
const TOKEN_EXPIRY_KEY = "jobscout_token_expiry";
const REMEMBER_ME_KEY = "jobscout_remember_me";

// Token expiry buffer (refresh 5 minutes before expiry)
const EXPIRY_BUFFER_MS = 5 * 60 * 1000;

/**
 * Get storage based on remember me preference
 */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  return rememberMe ? localStorage : sessionStorage;
}

/**
 * Store authentication tokens
 */
export function storeTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
  if (typeof window === "undefined") return;

  // Store remember me preference in localStorage (persists across sessions)
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));

  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

  // Calculate and store expiry time (assuming 30 min access token by default)
  const expiryTime = Date.now() + 30 * 60 * 1000;
  storage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  // Check both storages
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY)
  );
}

/**
 * Check if access token is expired or about to expire
 */
export function isTokenExpired(): boolean {
  if (typeof window === "undefined") return true;

  const expiryStr =
    localStorage.getItem(TOKEN_EXPIRY_KEY) ||
    sessionStorage.getItem(TOKEN_EXPIRY_KEY);

  if (!expiryStr) return true;

  const expiryTime = parseInt(expiryStr, 10);
  return Date.now() > expiryTime - EXPIRY_BUFFER_MS;
}

/**
 * Check if user has valid session
 */
export function hasValidSession(): boolean {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
}

/**
 * Clear all stored tokens
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;

  // Clear from both storages
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(TOKEN_EXPIRY_KEY);
  });

  localStorage.removeItem(REMEMBER_ME_KEY);
}

/**
 * Update tokens after refresh
 */
export function updateTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;

  const storage = getStorage();
  if (!storage) return;

  storage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);

  const expiryTime = Date.now() + 30 * 60 * 1000;
  storage.setItem(TOKEN_EXPIRY_KEY, String(expiryTime));
}

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

/**
 * Get user ID from stored token
 */
export function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;

  const payload = parseJwtPayload(token);
  return payload?.sub as string | null;
}

/**
 * Check if user is admin from token
 */
export function isAdminFromToken(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const payload = parseJwtPayload(token);
  return payload?.is_admin === true;
}

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
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
