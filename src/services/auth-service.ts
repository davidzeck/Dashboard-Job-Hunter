/**
 * Auth Service - Authentication related API calls
 * Handles all authentication operations including login, registration,
 * password reset, and session management
 */

import { apiClient } from "./api-client";
import type { User, AuthTokens } from "@/types";

// ============================================
// Types
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
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

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetConfirm {
  token: string;
  password: string;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ============================================
// Auth Service
// ============================================

export const authService = {
  /**
   * Login with email and password
   * Uses OAuth2 password flow with form data
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Invalid email or password");
    }

    return response.json();
  },

  /**
   * Register a new user account
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Registration failed" }));
      if (error.detail?.includes("already exists")) {
        throw new Error("An account with this email already exists");
      }
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    return response.json();
  },

  /**
   * Request password reset email
   * Returns success even if email doesn't exist (for security)
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // Always return success for security (don't reveal if email exists)
    if (!response.ok) {
      // Still return success to not reveal email existence
      return { message: "If an account exists, a reset email has been sent" };
    }

    return response.json();
  },

  /**
   * Reset password with token from email
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Reset failed" }));
      if (error.detail?.includes("expired")) {
        throw new Error("This reset link has expired. Please request a new one.");
      }
      if (error.detail?.includes("invalid")) {
        throw new Error("This reset link is invalid. Please request a new one.");
      }
      throw new Error(error.detail || "Failed to reset password");
    }

    return response.json();
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post("/auth/verify-email", { token });
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return apiClient.post("/auth/resend-verification", { email });
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/users/me");
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiClient.patch<User>("/users/me", data);
  },

  /**
   * Change password (requires current password)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post("/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  /**
   * Logout - invalidate tokens on server
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Ignore errors on logout - we're clearing local state anyway
    }
  },

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
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
    ip_address: string;
    last_active: string;
    is_current: boolean;
  }>> {
    return apiClient.get("/auth/sessions");
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<{ message: string }> {
    return apiClient.post("/auth/sessions/revoke-all");
  },
};

// ============================================
// Token Refresh Utility
// ============================================

let refreshPromise: Promise<AuthTokens> | null = null;

/**
 * Refresh token with deduplication
 * Ensures only one refresh request is made at a time
 */
export async function refreshTokenWithDedup(refreshToken: string): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = authService.refreshToken(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}
