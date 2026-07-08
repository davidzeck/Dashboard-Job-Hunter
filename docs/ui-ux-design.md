# UI / UX Design — "Urgent Clarity"

The design system is named **Urgent Clarity** (see comments in [tailwind.config.ts](../tailwind.config.ts) / [globals.css](../src/app/globals.css)): a fast-scanning, dark-first dashboard where *new* and *urgent* things pop and everything else stays quiet. The product's job is speed-to-application — the UI's job is to make the newest matching job unmissable.

## Theme model

- **Dark mode is primary** (`useUIStore` theme default `"dark"`); light mode fully supported. Toggle in the header; class-based switching (`darkMode: ["class"]`).
- All colors are **CSS custom properties** (HSL triplets) defined in [`src/app/globals.css`](../src/app/globals.css) under `:root` (light) and `.dark`, mapped into Tailwind as `hsl(var(--token))` in [`tailwind.config.ts`](../tailwind.config.ts). Change a color once in globals.css and every component follows.

## Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` / `--foreground` | white / near-black `222 84% 4.9%` | near-black / near-white | page + text |
| `--card`, `--popover` | white | same as background | surfaces (borders, not elevation, separate them) |
| `--primary` | **blue `217 91% 60%`** (#3B82F6-ish) | same blue | actions, links, focus ring, active nav |
| `--secondary`, `--muted`, `--accent` | slate `210 40% 96%` | slate `217 33% 17.5%` | quiet fills, hovers |
| `--muted-foreground` | `215 16% 47%` | `215 20% 65%` | secondary text |
| `--destructive` | red `0 84% 60%` | red `0 63% 50%` | delete, failures |
| `--urgent` ⭐ | **amber `38 92% 50%`**, black fg | same | Job-Scout-specific: new/hot items |
| `--success` ⭐ | green `142 76% 36%` | green `142 76% 46%` | healthy sources, ready CVs, good match scores |
| `--warning` ⭐ | amber (same as urgent) | same | degraded states |
| `--border` / `--input` / `--ring` | slate 91% / blue ring | slate 17.5% / blue ring | hairlines + focus |

⭐ = Job Scout extensions beyond the stock shadcn palette. Semantic usage in features: match score ≥75 → `success`, ≥50 → `warning`, else `destructive` (cv-match-card); source health dots via `.status-dot-active/-inactive/-error` utilities.

## Typography & shape

- **Inter** (`--font-inter`, loaded in the root layout) for everything; `--font-mono` for code-ish values. `font-feature-settings: "rlig", "calt"`.
- Radius scale from one var: `--radius: 0.5rem` → `rounded-lg/md/sm` derive via `calc`.
- Headings use `.text-balance`.

## Motion — deliberate and short

| Animation | Definition | Used for |
|---|---|---|
| `pulse-urgent` (2 s opacity pulse) | tailwind.config keyframes + `.urgent-pulse` utility | drawing the eye to urgent/new items |
| `slide-in-right` 0.3 s / `fade-in` 0.2 s | tailwind.config | toasts, entering panels |
| `accordion-down/up` 0.2 s | tailwind.config | Radix accordions |
| `.job-card-hover` | globals.css utility: `hover:scale-[1.02] hover:shadow-lg`, 200 ms ease-out | job cards |
| framer-motion | `main-layout.tsx` and feature components | sidebar collapse margin, list item entrances |

Keep new animations in this vocabulary (≤300 ms, ease-out, transform/opacity only).

## Component inventory

- **Primitives** ([`src/components/ui/`](../src/components/ui/)): shadcn-style over Radix — button, card, input, label, textarea, select, switch, tabs, table, badge, avatar, dropdown-menu, pagination, skeleton, spinner, empty-state. Variants via CVA; compose classes with `cn()` from [lib/utils.ts](../src/lib/utils.ts).
- **Charts** ([`ui/charts/`](../src/components/ui/charts/)): recharts wrappers (area, bar, donut) + `Sparkline` for stat cards. ⚠️ Overview charts currently render generated mock data ([known issue #5](../../docs/known-issues.md)).
- **Feedback**: toasts via `useToast()` (ui-store) rendered by `toast-container`; generic modal dispatcher (`useUIStore.modal` type/data) rendered by `components/shared/modal.tsx`; `loading-skeleton` + `empty-state` for async states.
- **Navigation**: collapsible sidebar (state persisted), header with ⌘K command palette (`components/shared/command-palette.tsx`), theme toggle, user menu.

## UX patterns to preserve

- **Scan-first lists**: jobs/companies/sources offer grid ⇄ table toggles (`view-toggle.tsx`); cards lead with title + company + freshness; badges carry status color semantics.
- **Filters refetch, never filter in place** — filter bars write params to the store; the server answers ([architecture.md](architecture.md)).
- **Progress honesty**: CV upload shows a real XHR progress bar; AI analysis shows explicit pending → polling → result states with score bar and keyword chips (present = success, missing = destructive/outline, suggested = secondary).
- **Empty states teach**: e.g. no ready CV in cv-match-card links to Settings → Documents; `user.has_cv === false` triggers the overview onboarding banner.
- **Auth screens** ((auth) layout) are split-screen: brand/value proposition left, form right; react-hook-form + zod with inline validation messages.

## Accessibility notes

Radix primitives supply focus management/ARIA; global `:focus-visible` ring (`ring-2 ring-ring ring-offset-2`) in globals.css; maintain color-contrast when using `urgent`/`warning` (black foreground on amber). Custom `.scrollbar-thin` keeps scrollbars subtle without hiding them.
