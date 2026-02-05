import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User, AuthTokens } from "@/types";
import { clearTokens } from "@/lib/auth";

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastActivity: number | null;
  sessionExpiry: number | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  setLoading: (isLoading: boolean) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateTokens: (tokens: AuthTokens) => void;
  clearError: () => void;
  updateActivity: () => void;
  checkSession: () => boolean;
  resetStore: () => void;
}

// Session timeout: 30 minutes of inactivity
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Token refresh threshold: 5 minutes before expiry
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

const initialState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastActivity: null,
  sessionExpiry: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),

      setTokens: (tokens) =>
        set((state) => {
          state.tokens = tokens;
          if (tokens) {
            // Set session expiry based on token (assuming 30 min access token)
            state.sessionExpiry = Date.now() + 30 * 60 * 1000;
          }
        }),

      setLoading: (isLoading) =>
        set((state) => {
          state.isLoading = isLoading;
        }),

      setRefreshing: (isRefreshing) =>
        set((state) => {
          state.isRefreshing = isRefreshing;
        }),

      setError: (error) =>
        set((state) => {
          state.error = error;
        }),

      login: (user, tokens) =>
        set((state) => {
          state.user = user;
          state.tokens = tokens;
          state.isAuthenticated = true;
          state.error = null;
          state.lastActivity = Date.now();
          state.sessionExpiry = Date.now() + 30 * 60 * 1000;
        }),

      logout: () => {
        // Clear tokens from storage
        clearTokens();
        // Clear cookie
        if (typeof window !== "undefined") {
          document.cookie = "jobscout_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        // Reset state
        set((state) => {
          Object.assign(state, initialState);
        });
      },

      updateUser: (updates) =>
        set((state) => {
          if (state.user) {
            state.user = { ...state.user, ...updates };
          }
        }),

      updateTokens: (tokens) =>
        set((state) => {
          state.tokens = tokens;
          state.sessionExpiry = Date.now() + 30 * 60 * 1000;
          state.isRefreshing = false;
          // Update cookie
          if (typeof window !== "undefined") {
            document.cookie = `jobscout_access_token=${tokens.access_token}; path=/; max-age=86400`;
          }
        }),

      clearError: () =>
        set((state) => {
          state.error = null;
        }),

      updateActivity: () =>
        set((state) => {
          state.lastActivity = Date.now();
        }),

      checkSession: () => {
        const state = get();
        if (!state.isAuthenticated || !state.sessionExpiry) {
          return false;
        }

        const now = Date.now();

        // Check if session has expired
        if (now > state.sessionExpiry) {
          get().logout();
          return false;
        }

        // Check for inactivity timeout
        if (state.lastActivity && now - state.lastActivity > SESSION_TIMEOUT_MS) {
          get().logout();
          return false;
        }

        return true;
      },

      resetStore: () =>
        set((state) => {
          Object.assign(state, initialState);
        }),
    })),
    {
      name: "jobscout-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAuthLoading = (state: AuthState) => state.isLoading;
export const selectIsRefreshing = (state: AuthState) => state.isRefreshing;
export const selectAuthError = (state: AuthState) => state.error;
export const selectAccessToken = (state: AuthState) => state.tokens?.access_token;
export const selectRefreshToken = (state: AuthState) => state.tokens?.refresh_token;

// Computed selectors
export const selectShouldRefreshToken = (state: AuthState): boolean => {
  if (!state.sessionExpiry || !state.isAuthenticated) return false;
  return Date.now() > state.sessionExpiry - REFRESH_THRESHOLD_MS;
};

export const selectIsAdmin = (state: AuthState): boolean => {
  return state.user?.is_admin ?? false;
};
