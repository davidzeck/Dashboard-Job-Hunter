# Feature Catalog — Page by Page

What each route shows and which components/hooks/stores it uses. Component paths are relative to [`src/`](../src/).

## `/overview` — [`app/(dashboard)/overview/page.tsx`](../src/app/%28dashboard%29/overview/page.tsx)

The landing dashboard.
- **Onboarding banner** when `user.has_cv === false` → deep-links to Settings → Documents.
- **"Recommended for you"** (`features/dashboard/components/recommended-jobs.tsx`, `useRecommendedJobs`): skill-matched job grid with match-% badge (≥75 success / ≥50 warning) + matched-skill chips; hidden without a CV; the overview's first non-admin content.
- **4 stat cards** (`features/dashboard/components/stats-card.tsx`): Total Jobs, New Today (with `Sparkline`), Active Sources, Alerts Sent — data from `useDashboardStats` → `GET /dashboard/stats`.
- **Charts** (`jobs-timeline-chart`, `source-performance-chart`, `scrape-activity-chart`): ⚠️ all fed by client-side `generateMock*` helpers, not the API ([known issue #5](../../docs/known-issues.md)).
- **Recent jobs** (`recent-jobs-list`, `useNewJobs(10)`), **activity feed**, **quick actions**, **source health panel** (`source-health`, `useErrorSources`).

## `/jobs` — [`app/(dashboard)/jobs/page.tsx`](../src/app/%28dashboard%29/jobs/page.tsx)

- Grid ⇄ table toggle (`features/jobs/components/view-toggle.tsx`), `job-card` / table rows via `job-list`.
- `job-filters` writes to `useJobsStore` filters (search/role, location, …) → `useJobs` refetches → store updated. Pagination from normalized `page_size/total_pages`.
- Bulk select with export/save actions.

## `/jobs/[id]` — [`app/(dashboard)/jobs/[id]/page.tsx`](../src/app/%28dashboard%29/jobs/[id]/page.tsx)

- Reads the job from `useJobsStore` (list or `selectedJob`). ⚠️ If absent (deep link/refresh) it falls back to a **hardcoded mock** after 500 ms instead of fetching ([known issue #6](../../docs/known-issues.md)).
- Header (title/company/badges), parsed description + requirements, company sidebar, job-details panel.
- **`CVMatchCard`** ([`features/jobs/components/cv-match-card.tsx`](../src/features/jobs/components/cv-match-card.tsx)) in the sidebar — the AI feature:
  - loads CVs via `useCVs`, filters `upload_status === "ready"`, auto-selects the first;
  - **Analyze Match** → `useAnalyzeCv` → cached result or `useTaskStatus` polling → score % (≥75 success / ≥50 warning / else destructive) + present/missing/suggested keyword badges;
  - **Tailor CV for This Job** → `useTailorCv` → tailored summary with copy-to-clipboard + keywords-added list;
  - **Curate Full CV (PDF/Word)** → `useCurateCv` → navigates to the `/cv-drafts/{draft_id}` review editor;
  - empty state links to `/settings` (Documents).

## `/cv-drafts/[id]` — [`app/(dashboard)/cv-drafts/[id]/page.tsx`](../src/app/%28dashboard%29/cv-drafts/[id]/page.tsx)

Status-driven curation-draft page (`DraftEditor`): `generating`/`approved` show polling spinners; `review` is the editor — per-section original↔tailored (summary + experience bullets side-by-side; contact/skills/education inline), injected-keyword chips, sticky **Save** / **Approve & generate documents** bar; `rendered` offers DOCX/PDF downloads; `failed`/`superseded` show recovery links. Entry point: the job page's CVMatchCard.

## `/sources` — [`app/(dashboard)/sources/page.tsx`](../src/app/%28dashboard%29/sources/page.tsx)

- List/table of scraper sources (`features/sources/components/`), filter bar, error banner; honors `?status=` from the overview health panel (wrapped in `Suspense` for `useSearchParams`).
- Actions: trigger scrape (`useTriggerScrape` → `POST /sources/:id/scrape`), toggle active (`useUpdateSource`), delete (`useDeleteSource`).

## `/sources/[id]` — [`app/(dashboard)/sources/[id]/page.tsx`](../src/app/%28dashboard%29/sources/[id]/page.tsx)

- Stats (jobs found, success rate, avg duration, total scrapes) + scrape-history table + danger zone.
- ⚠️ Falls back to a generated mock source + 10 mock log rows when not in the store; the action buttons here are **simulated with toasts**, not wired to services ([known issue #6](../../docs/known-issues.md)).

## `/companies` — [`app/(dashboard)/companies/page.tsx`](../src/app/%28dashboard%29/companies/page.tsx)

- Grid ⇄ table (`features/companies/components/`), search/active filters.
- Add/edit through the generic modal dispatcher (`useUIStore.openModal({type, data})` → `components/shared/modal.tsx`).
- `useCompanies`, `useDeleteCompany`, `useToggleCompanyActive`.

## `/companies/[id]` — [`app/(dashboard)/companies/[id]/page.tsx`](../src/app/%28dashboard%29/companies/[id]/page.tsx)

- Real fetching: `useCompany` + direct `useQuery`s for `sourcesService.getSourcesByCompany` and `jobsService.getJobsByCompany`. ⚠️ Those two hit `GET /companies/:id/sources|jobs`, which the backend doesn't expose yet ([known issue #8](../../docs/known-issues.md)).
- Stats cards + tabs: Sources / Recent Jobs.

## `/settings` — [`app/(dashboard)/settings/page.tsx`](../src/app/%28dashboard%29/settings/page.tsx)

Tabs driven by `useSettingsStore.activeTab` (`profile | notifications | security | preferences | documents`):

| Tab | Component | Notes |
|---|---|---|
| Profile | [`features/settings/components/profile-form.tsx`](../src/features/settings/components/profile-form.tsx) | `PATCH /users/me` |
| Notifications | `notification-settings.tsx` | ⚠️ targets unimplemented backend endpoints |
| Security | `security-settings.tsx` | change password works; sessions UI targets unimplemented endpoints |
| Preferences | inline `PreferencesSection` in the page | theme toggle wired to `useUIStore`; display/export controls mostly static |
| **Documents** | [`cv-management.tsx`](../src/features/settings/components/cv-management.tsx) | The CV hub: **CVUploadCard** (drag-drop PDF ≤5 MB, ≤10 CVs, XHR progress bar), **CVListCard** (status pills ready/processing/pending/failed, download via presigned URL, delete, skills count), **SkillsCard** (add/remove manual skills chips), **DraftsCard** (tailored-CV drafts list → `/cv-drafts/{id}`) |

## Auth pages — `app/(auth)/*`

Thin wrappers over `features/auth/components/` forms (react-hook-form + zod schemas in [`lib/validations/auth.ts`](../src/lib/validations/auth.ts)): `login` (demo-credentials button in demo mode), `register`, `forgot-password`, `reset-password` — ⚠️ the last two post to endpoints the backend hasn't implemented ([known issue #8](../../docs/known-issues.md)).

## Global chrome

- **Sidebar** ([`components/layout/sidebar.tsx`](../src/components/layout/sidebar.tsx)): Overview, Jobs, Sources, Companies, Settings; collapsible (persisted).
- **Header** ([`components/layout/header.tsx`](../src/components/layout/header.tsx)): ⌘K command palette, theme toggle, notifications bell (⚠️ badge hardcoded "3"), user menu with logout.
- **Command palette** (`components/shared/command-palette.tsx`): quick navigation.
