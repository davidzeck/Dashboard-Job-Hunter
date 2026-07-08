# Dashboard Folder Structure

All source under `src/`; `@/` aliases to `src/`. Feature-sliced: route files stay thin, feature components live under `features/<domain>/`.

```
Dashboard-Job-Hunter/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # root layout: fonts + Providers
│   │   ├── page.tsx                  # "/" → redirect /overview
│   │   ├── globals.css               # design tokens (CSS vars, light + .dark) + utilities
│   │   ├── (auth)/                   # login, register, forgot-password, reset-password
│   │   │   └── layout.tsx            # split-screen branding layout
│   │   └── (dashboard)/              # authenticated app
│   │       ├── layout.tsx            # MainLayout + ErrorBoundary + CommandPalette
│   │       ├── overview/page.tsx     # stats, charts, recent jobs, quick actions
│   │       ├── jobs/page.tsx         # list: grid/table, filters, bulk select
│   │       ├── jobs/[id]/page.tsx    # detail + CVMatchCard (AI sidebar)
│   │       ├── sources/page.tsx      # scraper sources list
│   │       ├── sources/[id]/page.tsx # source detail + scrape history
│   │       ├── companies/page.tsx    # company grid/table + add/edit modal
│   │       ├── companies/[id]/page.tsx
│   │       ├── settings/page.tsx     # 5 tabs (activeTab in settings-store)
│   │       └── scrape-logs/          # ⚠️ EMPTY — no page.tsx, route doesn't exist
│   │
│   ├── middleware.ts                 # cookie-based route protection (SSR edge)
│   │
│   ├── components/
│   │   ├── layout/                   # main-layout, sidebar, header
│   │   ├── shared/                   # command-palette, error-boundary, empty-state,
│   │   │                             #   loading-skeleton, modal, toast-container
│   │   └── ui/                       # shadcn/Radix primitives: button, card, input, badge,
│   │       │                         #   table, tabs, select, dropdown-menu, avatar, switch,
│   │       │                         #   textarea, pagination, skeleton, spinner, label…
│   │       └── charts/               # recharts wrappers: area, bar, donut, Sparkline
│   │
│   ├── features/                     # domain UI, grouped by feature
│   │   ├── auth/components/          # login/register/forgot/reset forms (RHF + zod)
│   │   ├── jobs/components/          # job-card, job-list, job-filters, view-toggle,
│   │   │                             #   cv-match-card (AI analyze/tailor sidebar)
│   │   ├── jobs/hooks/               # ⚠️ empty — hooks live in src/hooks/
│   │   ├── sources/components/       # source-card/-list/-table/-filters
│   │   ├── sources/hooks/            # ⚠️ empty
│   │   ├── companies/components/     # company-card/-list/-table/-filters
│   │   ├── dashboard/components/     # stats-card, recent-jobs-list, source-health,
│   │   │                             #   activity-feed, quick-actions, 3 chart components
│   │   └── settings/components/      # profile-form, notification-settings,
│   │                                 #   security-settings, cv-management
│   │
│   ├── hooks/                        # React Query hooks: use-auth, use-jobs, use-sources,
│   │                                 #   use-companies, use-cv, use-settings
│   ├── stores/                       # Zustand: auth, jobs, sources, companies, settings, ui
│   ├── services/                     # api-client + auth/jobs/sources/companies/settings/cv
│   │                                 #   services + mock-api-service (demo mode switch)
│   ├── types/index.ts                # shared API/domain types (watch for drift w/ backend)
│   ├── constants/index.ts            # endpoint map + option lists (services mostly inline paths)
│   └── lib/
│       ├── auth.ts                   # token storage utils (local/sessionStorage, expiry, JWT parse)
│       ├── mock-data.ts              # demo dataset (Kenyan tech companies) + query helpers
│       ├── providers.tsx             # React Query + theme + toast/modal providers
│       ├── utils.ts                  # cn() etc.
│       └── validations/auth.ts       # zod schemas for auth forms
│
├── docs/                             # ← you are here
├── next.config.js                    # incl. /api/v1/:path* rewrite to the backend
├── tailwind.config.ts                # design tokens → Tailwind theme (see ui-ux-design.md)
├── package.json                      # scripts: dev/build/start/lint/lint:fix/format/type-check
└── Dockerfile
```

## Where to make common changes

| Change | Touch these |
|---|---|
| New page | `src/app/(dashboard)/<route>/page.tsx` + nav item in `components/layout/sidebar.tsx` |
| New data domain | service in `src/services/` → hook in `src/hooks/` → store in `src/stores/` → components in `src/features/<domain>/components/` |
| New endpoint call | add to the existing domain service; go through `api-client` (never raw fetch in components) |
| New UI primitive | `src/components/ui/` (shadcn conventions, CVA variants) |
| Theme/token change | `src/app/globals.css` CSS vars + `tailwind.config.ts` mapping |
| New settings tab | `settings-store.ts` `activeTab` union + tab in `settings/page.tsx` + component in `features/settings/components/` |
