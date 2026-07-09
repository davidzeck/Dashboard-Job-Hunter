/**
 * API Client - Centralized HTTP client for all API calls
 * Handles authentication, error handling, and request/response transformation
 *
 * Auth model: short-lived access token in memory (auth store, never persisted);
 * refresh token in an httpOnly cookie. All requests go through the same-origin
 * Next.js rewrite (/api/v1/* → backend), so the cookie is first-party.
 * On a 401 the client silently refreshes once and retries the request.
 */

import { useAuthStore } from "@/stores";
import { clearAllUserState } from "@/lib/query-client";
import { refreshTokenWithDedup } from "./token-refresh";
import type { ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = useAuthStore.getState().tokens?.access_token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    // Base may be relative (/api/v1 via the Next rewrite) or absolute
    const base =
      typeof window !== "undefined"
        ? new URL(this.baseUrl, window.location.origin)
        : new URL(this.baseUrl, "http://localhost:3000");
    const url = new URL(`${base.pathname}${endpoint}`, base.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  // Backend uses { limit, pages }, dashboard expects { page_size, total_pages }
  private normalizePaginated<T>(data: unknown): T {
    if (
      data !== null &&
      typeof data === "object" &&
      "items" in data &&
      "limit" in data
    ) {
      const d = data as Record<string, unknown>;
      return { ...d, page_size: d.limit, total_pages: d.pages } as T;
    }
    return data as T;
  }

  private async parseError(response: Response): Promise<string> {
    let errorMessage = "An error occurred";
    try {
      const errorData: ApiError = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    return errorMessage;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(await this.parseError(response));
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    return this.normalizePaginated<T>(json);
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { method = "GET", body, headers = {}, params } = config;

    const url = this.buildUrl(endpoint, params);

    const doFetch = () =>
      fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

    let response = await doFetch();

    // 401 on a non-auth endpoint: silently refresh via the httpOnly cookie
    // and retry ONCE with the new access token.
    if (response.status === 401 && !endpoint.startsWith("/auth/")) {
      try {
        await refreshTokenWithDedup();
      } catch {
        useAuthStore.getState().logout();
        clearAllUserState();
        throw new Error("Session expired. Please log in again.");
      }
      response = await doFetch();
      if (response.status === 401) {
        useAuthStore.getState().logout();
        clearAllUserState();
        throw new Error("Session expired. Please log in again.");
      }
    }

    return this.handleResponse<T>(response);
  }

  // Convenience methods
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
