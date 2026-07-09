/**
 * Module-level React Query client + account-isolation helper.
 *
 * The client lives here (not inside a component) so non-React code — the
 * api-client's 401 handler, store-internal logout paths — can wipe cached
 * server data when the session ends. One user's cached responses (jobs with
 * their saved/applied flags, CV list, admin stats) must never render for the
 * next account on this browser.
 */

import { QueryClient } from "@tanstack/react-query";
import { resetUserScopedStores } from "@/stores";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Full client-side account wipe: every user-scoped Zustand store + the whole
 * React Query cache. Call on EVERY auth transition (logout, session expiry,
 * failed refresh) — from React or plain modules alike.
 */
export function clearAllUserState(): void {
  resetUserScopedStores();
  queryClient.clear();
}
