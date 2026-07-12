# API Integration

How the dashboard talks to the backend. Authoritative endpoint list: [backend api-reference.md](../../Job-backend/docs/api-reference.md).

## api-client — [`src/services/api-client.ts`](../src/services/api-client.ts)

Singleton around native `fetch`:

- Base URL: `NEXT_PUBLIC_API_URL || "/api/v1"` — **relative**: every call goes through the same-origin Next.js proxy (`/api/v1/:path*` rewrite in [next.config.js](../next.config.js), target = server-only `API_PROXY_URL`). That makes the backend's httpOnly refresh cookie first-party; no CORS.
- Injects `Authorization: Bearer <access_token>` from `useAuthStore.getState().tokens` (memory only).
- **401 on non-auth endpoints → silent refresh once** (via [token-refresh.ts](../src/services/token-refresh.ts) single-flight) **→ retry**; if the refresh or retry fails → `logout()` + "Session expired".
- Parses backend errors from `{detail}`.
- **`normalizePaginated`**: backend `{items, total, page, limit, pages}` → dashboard `{items, total, page, page_size, total_pages}`. This is the *only* place the rename happens.
- Methods: `get/post/put/patch/delete`.

## Data source

**Real backend only — there is no demo/mock mode** (removed 2026-07-08:
`mock-api-service.ts`, `mock-data.ts`, `isDemoMode()`). Every service calls the
live API through the same-origin proxy; `NEXT_PUBLIC_API_URL` must stay defined
as `/api/v1`. The Overview charts read real admin-only aggregation endpoints
(`/dashboard/jobs-timeline`, `/scrape-activity`, `/source-performance`,
`/activity`) via [`dashboard-service.ts`](../src/services/dashboard-service.ts).

## Service catalog — [`src/services/`](../src/services/)

| Service | Real endpoints called | Notes |
|---|---|---|
| [auth-service.ts](../src/services/auth-service.ts) | `POST /auth/login` (form + `remember_me`) → `GET /users/me`; `POST /auth/register`; refresh via [token-refresh.ts](../src/services/token-refresh.ts) (cookie); `POST /auth/logout`; `GET/DELETE /auth/sessions*`; forgot/reset password; verify-email/resend | Sends `X-Client: web` on login/register/refresh/logout → refresh token arrives as the httpOnly cookie, never in JS. All endpoints exist on the backend as of 2026-07-08 |
| [jobs-service.ts](../src/services/jobs-service.ts) | `GET /jobs` (page/limit/role/location + admin `validation_status`), `GET /jobs/recommended`, `GET /jobs/:id`, `GET /jobs?days_ago=1`, `GET /dashboard/stats` | `transformJob` renames backend fields (`apply_url→application_url`, `posted_at/discovered_at→first_seen_at/last_seen_at`, `is_active→status`). ⚠️ `updateJobStatus`, `getJobsByCompany`, `getJobsBySource` target endpoints the backend lacks |
| [sources-service.ts](../src/services/sources-service.ts) | `GET/POST /sources`, `GET/PATCH/DELETE /sources/:id`, `POST /sources/:id/scrape`, `GET /sources/:id/logs`, error-sources filter | demo-aware |
| [companies-service.ts](../src/services/companies-service.ts) | `GET/POST /companies`, `GET/PATCH/DELETE /companies/:id`, active filter | demo-aware |
| [settings-service.ts](../src/services/settings-service.ts) | notifications/alert-preferences/sessions/export endpoints | ⚠️ almost all of these **don't exist in the backend yet** — UI renders but saves fail against the real API |
| [cv-service.ts](../src/services/cv-service.ts) | full CV lifecycle + skills + AI (below) + **curation drafts** (`curateCv`, `listDrafts`, `getDraft`, `updateDraft`, `approveDraft`, `getDraftDownloadUrl`) | not demo-aware |

## Auth flow (httpOnly cookie model, since 2026-07-08)

```
LoginForm.onSubmit
  → authService.login({email, password, rememberMe})   # form POST + X-Client: web
      backend: Set-Cookie jobscout_refresh (httpOnly, SameSite=Lax,
               Max-Age 7d if rememberMe else session) + body {access_token, refresh_token: null}
  → useAuthStore.login(user, tokens)                   # access token in MEMORY only
  → router.push(callbackUrl)

Page reload (memory wiped):
  <AuthProvider> (mounted in lib/providers.tsx) → useAuth().bootstrapSession()
  → POST /auth/refresh (cookie) → new access token → GET /users/me → store
  → renders a splash until resolved (no 401 storms / logged-out flash)
```

- **Route protection**: [`src/middleware.ts`](../src/middleware.ts) (server-side, so it CAN read the httpOnly cookie) checks `jobscout_refresh` presence — UX guard only; the API is the security boundary. Demo mode (`NEXT_PUBLIC_DEMO_MODE=true`) bypasses it.
- **No tokens in web storage**: `lib/auth.ts` keeps only route lists + `parseJwtPayload`; the auth store persists just `{user, lastActivity}` (v2 migration drops v1's persisted tokens; legacy keys/cookies are purged on login/logout).
- **Session lifecycle** ([`src/hooks/use-auth.ts`](../src/hooks/use-auth.ts)): proactive refresh 5 min before expiry (from `expires_in`); 1-min inactivity check (30 min → logout); activity throttled to 1/min. Refresh is single-flight ([token-refresh.ts](../src/services/token-refresh.ts)) and rotation-safe (backend forks concurrent refreshes within a 60 s grace window).
- **Backstop**: api-client's 401 → refresh-retry-once → logout.
- **Admin gating**: sidebar hides Sources/Companies for non-admins (`selectIsAdmin`); [`admin-guard.tsx`](../src/components/shared/admin-guard.tsx) layouts redirect direct URL hits; `useDashboardStats` only runs for admins (endpoint is 403 otherwise).

## CV upload

3-step flow in [`cv-service.ts`](../src/services/cv-service.ts) (hook: `useUploadCV`):

1. SHA-256 of the file via Web Crypto → `POST /users/me/cv/presign` `{filename, file_size_bytes, file_hash}`.
2. **Direct S3 POST with `XMLHttpRequest`** — chosen over fetch for `upload.onprogress`. Presigned policy fields are appended to the `FormData` **before** the file, and **no Authorization header** is set (breaks the S3 signature).
3. `POST /users/me/cv/:cvId/confirm` → backend verifies + enqueues processing; the list then shows `processing` until `ready`.

Constraints mirrored client-side: PDF only, ≤5 MB, max 10 CVs. Presign is rate-limited 3/hour — surface the 429 message, don't retry.

## AI analyze / tailor + task polling

Types: `CVAnalysisResult`, `CVTailorResult`, generic `CVTaskStatusResponse<T>` (cv-service). Hooks in [`use-cv.ts`](../src/hooks/use-cv.ts):

- `useAnalyzeCv()` → `POST /users/me/cv/:id/analyze {job_id}`. Response is either a **cached result** (render immediately) or `{task_id}`.
- `useTaskStatus<T>(taskId)` → `GET /users/me/cv/tasks/:taskId` with `refetchInterval: 2000`, stopping on `success`/`failure`.
- `useTailorCv()` → always returns a `task_id`; same polling.
- 429 (10/hr or 50/day AI caps) → user-friendly toast; no auto-retry.

UI consumer: [`features/jobs/components/cv-match-card.tsx`](../src/features/jobs/components/cv-match-card.tsx) (CV selector → analyze → score + keyword badges → tailor → copy-to-clipboard).

## CV curation drafts (document export, 2026-07-12)

Hooks in `use-cv.ts`: `useCurateCv` (→ navigate to `/cv-drafts/{draft_id}`), `useDraft(id)` (polls 2 s while `generating`/`approved`, stops on `review`/`rendered`/`failed`), `useUpdateDraft`, `useApproveDraft`, `useDraftDownload` (opens the presigned URL). UI: status-driven editor at [`features/cv-drafts/components/draft-editor.tsx`](../src/features/cv-drafts/components/draft-editor.tsx) (original↔tailored per section, inline edits, sticky Save/Approve bar, DOCX/PDF downloads) + a "Tailored CVs" list card in Settings → Documents.

## Adding a new API call (checklist)

1. Confirm the endpoint exists in [backend api-reference.md](../../Job-backend/docs/api-reference.md) — several current service methods point at endpoints that don't ([known issue #8](../../docs/known-issues.md)).
2. Add the method to the domain service (use `apiClient`, normalize pagination only via `normalizePaginated`).
3. Add/extend the mock twin in `mock-api-service.ts` so demo mode keeps working.
4. Expose it through a React Query hook in `src/hooks/`; write list responses into the domain store.
5. Update types in `src/types/index.ts` to match the backend schema exactly.
