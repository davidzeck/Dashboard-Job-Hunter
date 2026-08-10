# Feature Catalog — Page by Page

What each route shows and which components/hooks/stores it uses. Component paths are relative to [`src/`](../src/).

## `/overview` — [`app/(dashboard)/overview/page.tsx`](../src/app/%28dashboard%29/overview/page.tsx)

**Client-first landing page (redesigned 2026-07-16).** For everyone:
- Personalized `PageHeader` ("Welcome back, {name}").
- **Onboarding banner** when `user.has_cv === false` → deep-links to `/cvs`.
- **Personal stats row** (clickable `StatsCard`s): Saved Jobs → `/my-jobs`, Applications → `/my-jobs?tab=applied`, Unread Alerts → `/alerts` (urgent variant when >0), AI Credits → `/cvs` — data from `useUserStats` (`GET /users/me/stats`) + `useAiUsage`.
- **"Recommended for you"** (`features/dashboard/components/recommended-jobs.tsx`, `useRecommendedJobs`): skill-matched job grid with match-% badge (≥75 success / ≥50 warning) + matched-skill chips; hidden without a CV.
- **Recent jobs** (`recent-jobs-list`, `useNewJobs(10)`) beside **client quick actions** (Browse jobs / Manage CVs / Review alerts / Edit skills & profile).

**Admins additionally** see a "Platform" section below a divider (`AdminPlatformSection` in the same file): the platform stat cards, charts, activity feed, admin quick actions, and source health — all `isAdmin`-gated so regular users never see empty widgets. `useErrorSources` is now admin-gated too.

## `/jobs` — [`app/(dashboard)/jobs/page.tsx`](../src/app/%28dashboard%29/jobs/page.tsx)

- Grid ⇄ table toggle (`features/jobs/components/view-toggle.tsx`), `job-card` / table rows via `job-list`. **JobCard (default grid view) has a save/bookmark toggle** (self-contained `SaveButton` using `useToggleSaveJob`).
- `job-filters` writes to `useJobsStore` filters (search/role, location, …) → `useJobs` refetches → store updated. Pagination from normalized `page_size/total_pages`.
- Deep links: `?new=1` (last 24 h) and `?company=slug` (from the Companies page) pre-filter the list.
- Bulk select with export/save actions.

## `/my-jobs` — [`app/(dashboard)/my-jobs/page.tsx`](../src/app/%28dashboard%29/my-jobs/page.tsx)

Saved | Applied tabs (`features/my-jobs/components/my-jobs-tabs.tsx`; `?tab=applied` deep-link). Paginated rows (title → job page, company, relative date) with Unsave / Undo / Apply actions; `useSavedJobs` (`GET /jobs/saved`) and `useAppliedJobs` (`GET /jobs/applied`). EmptyStates CTA to `/jobs`.

## `/alerts` — [`app/(dashboard)/alerts/page.tsx`](../src/app/%28dashboard%29/alerts/page.tsx)

The job-alert feed (`features/alerts/components/alerts-list.tsx`, `useAlerts` → `GET /alerts`): unread-dot rows with the matched job, "notified X ago" + channel, unread-only switch, **Mark all read** (`POST /alerts/read-all`), per-row Save / Applied / Apply quick actions (PATCH routes). Clicking a row marks it read and opens the job. The header bell and the sidebar Alerts badge show the live unread count from `useUserStats`.

## `/jobs/[id]` — [`app/(dashboard)/jobs/[id]/page.tsx`](../src/app/%28dashboard%29/jobs/[id]/page.tsx)

- Reads the job from `useJobsStore` (list or `selectedJob`). ⚠️ If absent (deep link/refresh) it falls back to a **hardcoded mock** after 500 ms instead of fetching ([known issue #6](../../docs/known-issues.md)).
- Header (title/company/badges), parsed description + requirements, company sidebar, job-details panel.
- **`CVMatchCard`** ([`features/jobs/components/cv-match-card.tsx`](../src/features/jobs/components/cv-match-card.tsx)) in the sidebar — the AI feature:
  - loads CVs via `useCVs`, filters `upload_status === "ready"`, auto-selects the first;
  - **Analyze Match** → `useAnalyzeCv` → cached result or `useTaskStatus` polling → score % (≥75 success / ≥50 warning / else destructive) + present/missing/suggested keyword badges;
  - **Tailor CV for This Job** → `useTailorCv` → tailored summary with copy-to-clipboard + keywords-added list;
  - **Curate Full CV (PDF/Word)** → `useCurateCv` → navigates to the `/cv-drafts/{draft_id}` review editor;
  - empty state links to `/cvs`.

## `/cvs` — [`app/(dashboard)/cvs/page.tsx`](../src/app/%28dashboard%29/cvs/page.tsx)

First-class client-facing CV hub (moved out of Settings → Documents, 2026-07-15). Renders [`CVManagement`](../src/features/cvs/components/cv-management.tsx): **CVUploadCard** (drag-drop PDF ≤5 MB, ≤10 CVs, XHR progress bar), **CVListCard** (status pills ready/processing/pending/failed, download via presigned URL, delete, skills count), **SkillsCard** (add/remove manual skills chips), **DraftsCard** (tailored-CV drafts list → `/cv-drafts/{id}`). Sidebar nav item "My CVs", visible to all users.

## `/cv-drafts/[id]` — [`app/(dashboard)/cv-drafts/[id]/page.tsx`](../src/app/%28dashboard%29/cv-drafts/[id]/page.tsx)

Status-driven curation-draft page (`DraftEditor`): `generating`/`approved` show polling spinners; `review` is the editor — per-section original↔tailored (summary + experience bullets side-by-side; contact/skills/education inline), injected-keyword chips, sticky **Save** / **Approve & generate documents** bar; `rendered` offers DOCX/PDF downloads; `failed`/`superseded` show recovery links. Entry point: the job page's CVMatchCard.

## `/sources` — [`app/(dashboard)/sources/page.tsx`](../src/app/%28dashboard%29/sources/page.tsx)

- List/table of scraper sources (`features/sources/components/`), filter bar, error banner; honors `?status=` from the overview health panel (wrapped in `Suspense` for `useSearchParams`).
- Actions: trigger scrape (`useTriggerScrape` → `POST /sources/:id/scrape`), toggle active (`useUpdateSource`), delete (`useDeleteSource`).

## `/sources/[id]` — [`app/(dashboard)/sources/[id]/page.tsx`](../src/app/%28dashboard%29/sources/[id]/page.tsx)

- Stats (jobs found, success rate, avg duration, total scrapes) + scrape-history table + danger zone.
- ⚠️ Falls back to a generated mock source + 10 mock log rows when not in the store; the action buttons here are **simulated with toasts**, not wired to services ([known issue #6](../../docs/known-issues.md)).

## `/companies` — [`app/(dashboard)/companies/page.tsx`](../src/app/%28dashboard%29/companies/page.tsx)

**Client-visible since 2026-07-16** (backend reads were always open; the AdminGuard layout was removed).
- Grid ⇄ table (`features/companies/components/`), search/active filters.
- Regular users: browse companies; card click → `/jobs?company=slug` (that company's jobs); "View Jobs" in the card menu.
- Admins only: Add Company button, Edit/Delete/Toggle-Active actions, "View Details" → `/companies/[id]` (handlers passed only when `isAdmin`).
- `useCompanies`, `useDeleteCompany`, `useToggleCompanyActive`.

## `/companies/[id]` — [`app/(dashboard)/companies/[id]/page.tsx`](../src/app/%28dashboard%29/companies/[id]/page.tsx)

- Real fetching: `useCompany` + direct `useQuery`s for `sourcesService.getSourcesByCompany` and `jobsService.getJobsByCompany`. ⚠️ Those two hit `GET /companies/:id/sources|jobs`, which the backend doesn't expose yet ([known issue #8](../../docs/known-issues.md)).
- Stats cards + tabs: Sources / Recent Jobs.

## `/settings` — [`app/(dashboard)/settings/page.tsx`](../src/app/%28dashboard%29/settings/page.tsx)

Tabs driven by `useSettingsStore.activeTab` (`profile | notifications | security | preferences`). The former **Documents** tab moved to the top-level `/cvs` page (2026-07-15).

| Tab | Component | Notes |
|---|---|---|
| Profile | [`features/settings/components/profile-form.tsx`](../src/features/settings/components/profile-form.tsx) | `PATCH /users/me` |
| Notifications | `notification-settings.tsx` | ⚠️ targets unimplemented backend endpoints |
| Security | `security-settings.tsx` | change password works; sessions UI targets unimplemented endpoints |
| Preferences | inline `PreferencesSection` + [`job-alert-preferences.tsx`](../src/features/settings/components/job-alert-preferences.tsx) | **Job Alert Preferences card** (role keywords / locations / company watchlist as chip inputs → `PUT /users/me/preferences`) + working theme toggle. The dead static Display/Export controls were removed (2026-07-16) |

## Auth pages — `app/(auth)/*`

Thin wrappers over `features/auth/components/` forms (react-hook-form + zod schemas in [`lib/validations/auth.ts`](../src/lib/validations/auth.ts)): `login` (demo-credentials button in demo mode), `register`, `forgot-password`, `reset-password` — ⚠️ the last two post to endpoints the backend hasn't implemented ([known issue #8](../../docs/known-issues.md)).

## Global chrome

- **Sidebar** ([`components/layout/sidebar.tsx`](../src/components/layout/sidebar.tsx)): client group for all users — Overview, Jobs, My Jobs, Alerts (live unread pill from `useUserStats`), My CVs, Companies, Settings — plus an "ADMIN" section (Sources) shown only to admins; collapsible (persisted).
- **Header** ([`components/layout/header.tsx`](../src/components/layout/header.tsx)): ⌘K command palette, theme toggle, **notifications bell with the real unread-alerts count** (hidden at 0, "9+" cap) linking to `/alerts`, user menu with logout.
- **Command palette** (`components/shared/command-palette.tsx`): quick navigation incl. My Jobs / Alerts / My CVs; admin entries (Sources, Add Source/Company, Trigger Scrapes) shown only to admins.
