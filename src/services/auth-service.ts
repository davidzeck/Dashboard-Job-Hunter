/**
 * Auth Service - Authentication related API calls
 * Handles all authentication operations including login, registration,
 * password reset, and session management
 * Supports demo mode with mock data
 *
 * Web auth contract (X-Client: web):
 * - login/register/refresh set the refresh token as an httpOnly cookie and
 *   return refresh_token: null in the body — JS never holds a long-lived
 *   credential. The access token lives in the auth store (memory only).
 */

import { apiClient } from "./api-client";
import { refreshTokenWithDedup } from "./token-refresh";
import { isDemoMode, mockAuthService, mockSettingsService } from "./mock-api-service";
import type { User, AuthTokens } from "@/types";

// ============================================
// Types
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

interface UpdateProfileData {
  full_name?: string;
  email?: string;
}

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const WEB_HEADERS = { "X-Client": "web" };

// ============================================
// Auth Service
// ============================================

export const authService = {
  /**
   * Login with email and password
   * OAuth2 password form (username = email) + remember_me; the refresh token
   * arrives as an httpOnly cookie, not in the body.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (isDemoMode()) {
      return mockAuthService.login(credentials.email, credentials.password);
    }

    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);
    formData.append("remember_me", credentials.rememberMe ? "true" : "false");

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...WEB_HEADERS,
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Invalid email or password");
    }

    const tokens: AuthTokens = await response.json();
    const userRes = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userRes.ok) {
      throw new Error("Failed to fetch user profile after login");
    }
    const user = await userRes.json();
    return { user, tokens };
  },

  /**
   * Register a new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    if (isDemoMode()) {
      return mockAuthService.register(data);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...WEB_HEADERS,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Registration failed" }));
      if (error.detail?.includes("already")) {
        throw new Error("An account with this email already exists");
      }
      throw new Error(error.detail || "Registration failed");
    }

    const tokens: AuthTokens = await response.json();
    const userRes = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userRes.ok) {
      throw new Error("Failed to fetch user profile after registration");
    }
    const user = await userRes.json();
    return { user, tokens };
  },

  /**
   * Refresh the access token via the httpOnly refresh cookie
   */
  async refreshToken(): Promise<AuthTokens> {
    if (isDemoMode()) {
      return {
        access_token: "demo_access_token_" + Date.now(),
        refresh_token: null,
        token_type: "bearer",
        expires_in: 1800,
      };
    }
    return refreshTokenWithDedup();
  },

  /**
   * Request password reset email
   * Returns success even if email doesn't exist (for security)
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return { message: "If an account exists, a reset email has been sent" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // Always return success for security (don't reveal if email exists)
    if (!response.ok) {
      return { message: "If an account exists, a reset email has been sent" };
    }

    return response.json();
  },

  /**
   * Reset password with token from email
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return { message: "Password reset successfully" };
    }

    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, new_password: password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Reset failed" }));
      if (error.detail?.includes("expired") || error.detail?.includes("Invalid")) {
        throw new Error("This reset link is invalid or has expired. Please request a new one.");
      }
      throw new Error(error.detail || "Failed to reset password");
    }

    return response.json();
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return { message: "Email verified successfully" };
    }
    return apiClient.post("/auth/verify-email", { token });
  },

  /**
   * Resend verification email (for the logged-in account)
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    if (isDemoMode()) {
      return { message: "Verification email sent" };
    }
    return apiClient.post("/auth/resend-verification");
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    if (isDemoMode()) {
      return mockAuthService.getCurrentUser();
    }
    return apiClient.get<User>("/users/me");
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    if (isDemoMode()) {
      return mockAuthService.updateProfile(data);
    }
    return apiClient.patch<User>("/users/me", data);
  },

  /**
   * Change password (requires current password; revokes other sessions)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return mockAuthService.changePassword();
    }
    return apiClient.post("/users/me/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Logout - revokes the refresh session server-side and clears the cookie
   */
  async logout(): Promise<void> {
    if (isDemoMode()) {
      return;
    }
    try {
      const token = (await import("@/stores")).useAuthStore.getState().tokens
        ?.access_token;
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...WEB_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
    } catch {
      // Ignore errors on logout - we're clearing local state anyway
    }
  },

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    if (isDemoMode()) {
      return true;
    }
    try {
      await apiClient.get("/auth/validate");
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get active sessions for user
   */
  async getActiveSessions(): Promise<Array<{
    id: string;
    device: string;
    browser?: string;
    ip_address: string;
    location?: string;
    last_active: string;
    is_current: boolean;
  }>> {
    if (isDemoMode()) {
      return mockSettingsService.getActiveSessions();
    }
    return apiClient.get("/auth/sessions");
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    if (isDemoMode()) {
      return mockSettingsService.revokeSession(sessionId);
    }
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<{ message: string }> {
    if (isDemoMode()) {
      return mockSettingsService.revokeAllSessions();
    }
    return apiClient.post("/auth/sessions/revoke-all");
  },
};

// Re-export for existing imports (hook uses this)
export { refreshTokenWithDedup };
