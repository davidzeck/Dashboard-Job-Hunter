# Dashboard Architecture

## App Router layout

```
src/app/
├── layout.tsx                # root: Inter font, <Providers> (React Query + Theme + Toast/Modal)
├── page.tsx                  # "/" → redirect("/overview")
├── (auth)/                   # route group — split-screen branding layout
│   └── login | register | forgot-password | reset-password
└── (dashboard)/              # route group — MainLayout (Sidebar + Header) + ErrorBoundary + CommandPalette
    └── overview | jobs[/[id]] | sources[/[id]] | companies[/[id]] | settings
```

Route protection is cookie-based in [`src/middleware.ts`](../src/middleware.ts) (see [api-integration.md](api-integration.md#auth-flow)); everything else is client components — there is no server-side data fetching.

## The state model (the one pattern to internalize)

```
   URL/UI params            server data
        │                       │
        ▼                       ▼
  Zustand store  ◀── writes ── React Query hook ── calls ──▶ domain service ──▶ api-client ──▶ backend
        │
        ▼ selectors
    components
```

- **Zustand stores** ([`src/stores/`](../src/stores/)) hold two things: the last API response (read-only) and the UI params that produced it (filters, sort, page). **No client-side filtering** — changing a filter updates the store, the hook refetches with new params, the response replaces the slice.
- **React Query hooks** ([`src/hooks/`](../src/hooks/)) own fetching/caching/mutations; effects write results into the store (e.g. `useJobs` reads params from `useJobsStore`, fetches, `setJobs`).
- **Components** read store selectors and call store param-setters or hook mutations. They never call services directly.

## Store catalog

All stores use `immer`; `auth` and `ui` also `persist` to localStorage.

| Store | File | Holds | Persisted |
|---|---|---|---|
| `useAuthStore` | [auth-store.ts](../src/stores/auth-store.ts) | `user`, `tokens`, `isAuthenticated`, session expiry/activity; `login`/`logout` also write/clear the `jobscout_access_token` **cookie**; `checkSession` enforces 30-min inactivity | ✅ `jobscout-auth` |
| `useJobsStore` | [jobs-store.ts](../src/stores/jobs-store.ts) | `jobs[]`, pagination, `filters`, `sort` (default `first_seen_at desc`), `selectedJob`; filter/sort setters reset page to 1 | — |
| `useSourcesStore` | [sources-store.ts](../src/stores/sources-store.ts) | same shape + `scrapeLogs[]` | — |
| `useCompaniesStore` | [companies-store.ts](../src/stores/companies-store.ts) | same shape, sort default `name asc` | — |
| `useSettingsStore` | [settings-store.ts](../src/stores/settings-store.ts) | notification/alert/user preferences, sessions, `activeTab` (`profile\|notifications\|security\|preferences\|documents`) | — |
| `useUIStore` | [ui-store.ts](../src/stores/ui-store.ts) | sidebar state, `theme` (default **dark**), generic `modal {type, data}` dispatcher, `toasts[]` + `useToast()` helper, command palette flag | ✅ `jobscout-ui` (sidebar + theme only) |

## Hook catalog — [`src/hooks/`](../src/hooks/)

`use-auth` (session refresh scheduling, activity tracking, `useRequireAuth`), `use-jobs`, `use-sources`, `use-companies`, `use-settings`, and `use-cv` (`useCVs`, `useUploadCV` with progress, `useSkills`/`useAddSkill`/`useRemoveSkill`, `useAnalyzeCv`, `useTailorCv`, `useTaskStatus<T>` polling every 2 s until terminal).

Note: `src/features/jobs/hooks/` and `src/features/sources/hooks/` directories exist but are **empty** — hooks all live in `src/hooks/`.

## Services layer

One service per domain in [`src/services/`](../src/services/) wrapping the `api-client` singleton; mock twins in `mock-api-service.ts` backed by [`src/lib/mock-data.ts`](../src/lib/mock-data.ts). Full endpoint tables and the demo-mode branching rules: [api-integration.md](api-integration.md).

## Layout & shared components

- [`components/layout/main-layout.tsx`](../src/components/layout/main-layout.tsx): Sidebar (collapsible, 5 nav items) + Header (command-palette search, theme toggle, notifications, user menu/logout) + animated content margin.
- [`components/shared/`](../src/components/shared/): `command-palette`, `error-boundary`, `empty-state`, `loading-skeleton`, `modal` (renders whatever `useUIStore.modal` dispatches), `toast-container`.
- [`components/ui/`](../src/components/ui/): shadcn/Radix primitives + `charts/` (recharts area/bar/donut wrappers + Sparkline). See [ui-ux-design.md](ui-ux-design.md).

## Error & loading conventions

- Route-level `ErrorBoundary` wraps the dashboard group.
- Hooks surface `isLoading`/`error` into stores; pages render `loading-skeleton` / `empty-state` / inline error banners.
- API 401 → global logout + redirect (api-client); 429 from AI endpoints → friendly toast, no auto-retry.

## Key dependencies

`next` 14.1 · `react` 18.2 · `zustand` 4.5 (+immer) · `@tanstack/react-query` 5 · `react-hook-form` + `zod` · Radix UI set + `lucide-react` · `tailwindcss` 3.4 + `tailwindcss-animate` + CVA/clsx/tailwind-merge · `framer-motion` 11 · `recharts` 3 · `date-fns`. (⚠️ `axios` is listed but unused — native fetch/XHR throughout.)
