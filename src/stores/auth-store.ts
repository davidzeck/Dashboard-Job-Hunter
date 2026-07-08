import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { User, AuthTokens } from "@/types";

interface AuthState {
  // State
  user: User | null;
  tokens: AuthTokens | null; // MEMORY ONLY — never persisted (see partialize)
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

const DEFAULT_ACCESS_TTL_MS = 30 * 60 * 1000;

function expiryFrom(tokens: AuthTokens): number {
  return Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : DEFAULT_ACCESS_TTL_MS);
}

/** Remove auth artifacts of the pre-httpOnly-cookie era. */
function purgeLegacyStorage() {
  if (typeof window === "undefined") return;
  ["jobscout_access_token", "jobscout_refresh_token", "jobscout_token_expiry", "jobscout_remember_me"].forEach(
    (key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  );
  // Legacy JS-readable cookie (replaced by the httpOnly jobscout_refresh cookie)
  document.cookie = "jobscout_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

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
            state.sessionExpiry = expiryFrom(tokens);
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

      login: (user, tokens) => {
        purgeLegacyStorage();
        set((state) => {
          state.user = user;
          state.tokens = tokens;
          state.isAuthenticated = true;
          state.error = null;
          state.lastActivity = Date.now();
          state.sessionExpiry = expiryFrom(tokens);
        });
        // No cookie writes here: the refresh token is an httpOnly cookie set
        // by the backend; middleware reads THAT for route protection.
      },

      logout: () => {
        purgeLegacyStorage();
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
          state.sessionExpiry = expiryFrom(tokens);
          state.isRefreshing = false;
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

        // Session expiry is refreshed by the token-refresh cycle; a stale one
        // means refresh has been failing.
        if (now > state.sessionExpiry + REFRESH_THRESHOLD_MS) {
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
      version: 2, // v2: tokens are no longer persisted (httpOnly cookie model)
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        lastActivity: state.lastActivity,
      }),
      migrate: (persisted: unknown) => {
        // Drop tokens/expiry persisted by v1
        const p = (persisted ?? {}) as Record<string, unknown>;
        return {
          user: p.user ?? null,
          lastActivity: (p.lastActivity as number) ?? null,
        };
      },
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

// Computed selectors
export const selectShouldRefreshToken = (state: AuthState): boolean => {
  if (!state.sessionExpiry || !state.isAuthenticated) return false;
  return Date.now() > state.sessionExpiry - REFRESH_THRESHOLD_MS;
};

export const selectIsAdmin = (state: AuthState): boolean => {
  return state.user?.is_admin ?? false;
};
