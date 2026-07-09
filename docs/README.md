# Job Scout Dashboard — Documentation

Next.js 14 (App Router) + TypeScript web client. The full-featured surface for Job Scout: job browsing, scraper/source administration, company management, and the **primary CV management + AI (ATS) experience**.

System-level context: [`../../docs/`](../../docs/README.md) · Backend API contract: [`../../Job-backend/docs/api-reference.md`](../../Job-backend/docs/api-reference.md)

## Docs in this folder

| Doc | What it covers |
|---|---|
| [architecture.md](architecture.md) | App Router layout, Providers, the Zustand + React Query state model |
| [folder-structure.md](folder-structure.md) | Annotated tree of `src/` |
| [ui-ux-design.md](ui-ux-design.md) | "Urgent Clarity" design system: tokens, dark theme, components, motion |
| [api-integration.md](api-integration.md) | api-client, service catalog, auth/token/cookie flow, CV upload, task polling (real backend only) |
| [features.md](features.md) | Page-by-page catalog with the components/hooks/stores each uses |

## Quick start

```bash
cd Dashboard-Job-Hunter
npm install

# Real backend required (start Job-backend first). Same-origin proxy:
cp .env.local.example .env.local     # NEXT_PUBLIC_API_URL=/api/v1
npm run dev            # → http://localhost:3000
# There is no demo/mock mode — the dashboard talks to the live API only.
```

Checks: `npm run lint` · `npm run type-check` · `npm run build`. There are no unit/e2e tests yet.

## Orientation in 60 seconds

- Routes live in [`src/app/`](../src/app/) in two groups: `(auth)` and `(dashboard)`. Sidebar nav: Overview, Jobs, Sources, Companies, Settings.
- Data flow is one pattern everywhere: **React Query hook fetches → writes response into a Zustand store → components read store selectors**. Stores never filter client-side; params go back through the API ([architecture.md](architecture.md)).
- All HTTP goes through the fetch singleton [`src/services/api-client.ts`](../src/services/api-client.ts) (Bearer injection, 401→logout, pagination normalization).
- Demo mode is decided by `isDemoMode()` in [`src/services/mock-api-service.ts`](../src/services/mock-api-service.ts) — ⚠️ `cv-service` and `settings-service` ignore it and always hit the real API.
- ⚠️ Known rough edges (mock chart data, detail-page fallbacks, endpoints the backend doesn't have): [`../../docs/known-issues.md`](../../docs/known-issues.md) #5–#12.

## Conventions

- **UI**: shadcn/ui primitives in [`src/components/ui/`](../src/components/ui/), composed into feature components under [`src/features/<domain>/components/`](../src/features/). Dark theme is primary.
- **State**: new server data → add to the domain service + a React Query hook in [`src/hooks/`](../src/hooks/) + (if listed/filtered) a Zustand store slice. Don't fetch in components.
- **Types**: shared API types in [`src/types/index.ts`](../src/types/index.ts) — keep them in sync with backend schemas (they have drifted before, see known issues #10).
- **Pagination**: components consume `page_size`/`total_pages`; the backend's `limit`/`pages` are renamed once in `api-client.ts` — never re-normalize elsewhere.
- **S3 uploads**: `XMLHttpRequest` with progress events, **no JWT header** ([api-integration.md](api-integration.md#cv-upload)).
