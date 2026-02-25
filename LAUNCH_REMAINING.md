# Job Scout Dashboard — Launch Remaining

_Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · Recharts_
_Last updated: 2026-02-25_

---

## Current State

The dashboard has a complete UI shell with all major pages built:
- Auth flow: login, register, forgot-password, reset-password forms
- Overview: stats cards, charts (area, bar, donut), activity feed, source health
- Jobs: list + detail pages with filters and view toggle (grid/table)
- Companies: list + detail pages
- Sources: list + detail pages with scraper status indicators
- Settings: profile form, notification settings, security settings
- Shared components: command palette, modal, toast, skeleton loaders
- Zustand stores for all domains (auth, jobs, companies, sources, settings, ui)

**The entire dashboard runs on mock data.** No API calls reach the real backend. Every service file calls `mock-api-service.ts` or returns hardcoded data.

---

## P0 — Blockers (not production-ready without these)

### 1. Wire all service calls to the real API
Every feature page imports from mock services. Each domain has both a real service file and a mock — the mock is always used.

**Files to replace mock calls in:**
| File | Mock method | Real backend endpoint |
|------|-------------|----------------------|
| `src/services/auth-service.ts` | mock login/register | `POST /auth/login`, `POST /auth/register` |
| `src/services/jobs-service.ts` | mock job list/detail | `GET /jobs/`, `GET /jobs/{id}` |
| `src/services/companies-service.ts` | mock company list | `GET /companies/`, `GET /companies/{id}` |
| `src/services/sources-service.ts` | mock source list | `GET /sources/`, `GET /sources/{id}` |
| `src/services/settings-service.ts` | mock profile update | `PATCH /users/me`, `PUT /users/me/preferences` |

The `api-client.ts` Axios/fetch wrapper is already set up with `API_BASE_URL` — it just needs to be used.

---

### 2. Auth session enforcement
`src/middleware.ts` exists but may not correctly redirect unauthenticated users away from dashboard routes. The `use-auth.ts` hook returns mock user data.

**Required:**
- Store JWT tokens in `httpOnly` cookies (via a `/api/auth/session` Next.js route handler) or `localStorage` with a refresh mechanism
- `middleware.ts` must check for a valid session on all `/(dashboard)/*` routes
- Implement token refresh in `api-client.ts` (401 → refresh → retry, same pattern as the mobile app)
- `use-auth.ts` should read the real authenticated user from `/users/me`

---

### 3. Sources CRUD + manual scrape trigger
The Sources page shows status badges and scrape logs but has no create/edit/delete functionality.

**Required UI + API wiring:**
- **Create source form**: company, URL, scraper class, frequency — calls `POST /sources/`
- **Edit source**: update URL and frequency inline — calls `PATCH /sources/{id}`
- **Deactivate toggle**: enable/disable a source — calls `PATCH /sources/{id}`
- **"Scrape Now" button** on source detail page — calls `POST /sources/{id}/scrape`
- **Live scrape log feed**: poll `GET /sources/{id}/logs` every 5s while a scrape is running

This is the dashboard's primary operational value. Without it, an operator cannot add new companies without direct database access.

---

### 4. Real-time scrape status
The overview page has a `ScrapeActivityChart` and `SourceHealth` component using static mock data. In production, operators need to see live scraper health.

**Options (ascending complexity):**
- **Poll**: refetch `GET /sources/` every 30s — simplest, sufficient for MVP
- **SSE**: `GET /scrape-feed` server-sent events — real-time without WebSocket complexity
- **WebSocket**: full bidirectional — overkill for this use case

**Recommendation**: poll `/admin/stats` every 30s for the overview, poll source detail every 10s during active scrapes.

---

### 5. Overview stats from real API
`DashboardStats` cards and all charts render `mockDashboardStats`. Wire to `GET /admin/stats` (backend item #16).

| Card | Backend field |
|------|--------------|
| Total Jobs | `total_jobs` |
| New Today | `new_jobs_today` |
| Active Sources | `active_sources` |
| Alerts Sent Today | `alerts_sent_today` |
| Failed Scrapes | `failed_scrapes_today` |

Chart data (scrapes over time, jobs per company) requires a `GET /admin/stats/history?days=7` endpoint.

---

## P1 — Required for production quality

### 6. User management page
No admin user management exists. Add a `/users` page with:
- Paginated user list: name, email, join date, last active, skill count, verified status
- User detail: alert history, saved jobs, application statuses
- Actions: deactivate account, re-send verification email
- Calls `GET /admin/users` and `POST /admin/users/{id}/deactivate`

---

### 7. Settings forms actually save
The profile form and notification settings form in Settings call mock functions. They need to call the real API:
- Profile: `PATCH /users/me` (full name, phone)
- Password change: `POST /users/me/change-password`
- Notification prefs: `PUT /users/me/preferences`

---

### 8. Pagination wired to API
The `Pagination` component (`src/components/ui/pagination.tsx`) exists but is disconnected from page state in `jobs-store.ts` and `sources-store.ts`. Every list endpoint returns `page`, `pages`, `total` — the UI needs to send `page` as a query param and update on navigation.

---

### 9. Error handling + empty states
All pages render mock data so error states have never been tested:
- Add a global error boundary that catches API failures and shows a retry option
- Each list page needs a "no results" empty state when the API returns 0 items
- API errors should show a toast notification (infrastructure exists in `toast-container.tsx`, just not wired)

---

### 10. Command palette connected to real data
`command-palette.tsx` exists but searches through static mock job/company arrays. Wire it to:
- `GET /jobs/?role={query}` for job search
- `GET /companies/?search={query}` for company search

Debounce at 300ms, show top 5 results of each type.

---

### 11. Job detail actions
The job detail page (`/jobs/[id]`) renders job information but has no admin actions:
- **Mark as expired**: `PATCH /jobs/{id}` with `{ status: "expired" }`
- **Flag as duplicate**: link two job records
- **View matched users**: which users were notified about this job

---

### 12. Audit log / activity feed
The `activity-feed.tsx` component on the overview uses static events. Replace with a real audit log endpoint:
- Scrape completed / failed
- New jobs discovered
- User notifications sent
- Source enabled / disabled

---

## P2 — Enterprise polish

### 13. Role-based access control
Currently no distinction between admin and regular users exists in the dashboard. Define two roles:

| Role | Permissions |
|------|------------|
| Admin | All pages including user management, source CRUD, scrape triggers |
| Viewer | Read-only: jobs, companies, overview stats |

Add `user.is_admin` check in `middleware.ts` and hide admin-only nav items.

---

### 14. Export functionality
Operators and analysts need to export data:
- **Jobs CSV**: filtered job list → `GET /jobs/?format=csv`
- **Scrape report**: source health summary with success/failure rates → PDF or CSV
- **User report**: registered users with activity summary

---

### 15. Dark mode
The Flutter mobile app has full dark mode. The dashboard is light-only. Tailwind supports dark mode via `class` strategy — add a theme toggle to the header that writes to `localStorage` and applies `dark` class to `<html>`.

---

### 16. Notification preferences that reflect real data
The notification settings page renders hardcoded toggles (push, email). These should read from `GET /users/me` → `preferences.notifications` and save via `PUT /users/me/preferences`.

---

### 17. Scraper configuration editor
Advanced operators need to edit per-source scraper configuration (CSS selectors, API keys, rate limits) without redeploying. Add a JSON editor panel on the source detail page that calls `PATCH /sources/{id}` with updated `config`.

---

### 18. Two-factor authentication UI
The security settings page in `security-settings.tsx` shows a placeholder 2FA toggle. This requires:
- TOTP setup flow (QR code generation on backend)
- Backup codes display
- `PUT /users/me/2fa/enable` and `DELETE /users/me/2fa`

---

## Page / Feature Status

| Page | UI Built | API Wired | Actions Work |
|------|----------|-----------|--------------|
| Login / Register | ✓ | ✗ | ✗ |
| Forgot / Reset Password | ✓ | ✗ | ✗ |
| Overview Dashboard | ✓ | ✗ mock data | ✗ |
| Jobs List | ✓ | ✗ mock data | ✗ |
| Job Detail | ✓ | ✗ mock data | ✗ |
| Companies List | ✓ | ✗ mock data | ✗ |
| Company Detail | ✓ | ✗ mock data | ✗ |
| Sources List | ✓ | ✗ mock data | ✗ |
| Source Detail | ✓ | ✗ mock data | ✗ |
| Source Create/Edit | ✗ | ✗ | ✗ |
| User Management | ✗ | ✗ | ✗ |
| Settings — Profile | ✓ | ✗ mock | ✗ |
| Settings — Notifications | ✓ | ✗ mock | ✗ |
| Settings — Security | ✓ UI shell | ✗ | ✗ |
| Command Palette | ✓ UI | ✗ mock data | ✗ |
| Audit / Activity Log | ✓ UI | ✗ mock data | ✗ |

---

## Recommended implementation order

1. Replace `mock-api-service.ts` with real calls in `api-client.ts` — unblocks everything
2. Fix auth session middleware + token refresh
3. Wire overview stats + chart data to `/admin/stats`
4. Wire jobs, companies, sources list + detail pages
5. Implement sources CRUD + "Scrape Now" button
6. Wire settings forms to `PATCH /users/me`
7. Add pagination to all list pages
8. User management page
9. Real-time polling for scrape status
10. Export functionality, dark mode, RBAC
