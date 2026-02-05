# Job Scout Dashboard - Implementation Plan

> A comprehensive phase-by-phase guide for completing the Job Scout Dashboard implementation.

---

## Current State (Foundation Complete)

### ✅ Completed Infrastructure
- [x] Project scaffolding with Next.js 14 App Router
- [x] Tailwind CSS configuration with Job Scout design tokens
- [x] TypeScript configuration with path aliases
- [x] Zustand stores (auth, jobs, sources, UI)
- [x] API client and service layer structure
- [x] Base UI components (Button, Card, Input, Badge, etc.)
- [x] Layout components (Sidebar, Header, MainLayout)
- [x] Feature component structure (Dashboard, Jobs, Sources)
- [x] Custom hooks for data fetching (useJobs, useSources)
- [x] Toast and Modal systems
- [x] Docker configuration

---

## Phase 1: Authentication System
**Priority: Critical | Estimated Effort: Medium**

### Objectives
- Implement secure JWT-based authentication
- Add route protection for dashboard pages
- Handle token refresh and session persistence

### Tasks

#### 1.1 Auth Middleware & Route Protection
```
src/
├── middleware.ts                    # Next.js middleware for route protection
├── lib/
│   └── auth.ts                      # Auth utilities (token validation, etc.)
```

**middleware.ts**
- Intercept requests to protected routes
- Check for valid access token in cookies/localStorage
- Redirect to `/login` if unauthorized
- Handle token refresh if expired

#### 1.2 Enhanced Login Page
```
src/app/(auth)/
├── login/page.tsx                   # ✅ Basic structure exists
├── register/page.tsx                # NEW: Registration form
├── forgot-password/page.tsx         # NEW: Password reset request
└── reset-password/page.tsx          # NEW: Password reset form
```

**Enhancements:**
- Form validation with error messages
- "Remember me" functionality
- Social login buttons (optional, future)
- Loading states and error handling
- Redirect to intended page after login

#### 1.3 Auth Store Enhancements
```
src/stores/auth-store.ts
```

**Add:**
- Token refresh logic
- Session timeout handling
- "Remember me" persistence option
- Logout cleanup (clear all stores)

#### 1.4 Auth Service Completion
```
src/services/auth-service.ts
```

**Implement:**
- `register()` - User registration
- `forgotPassword()` - Request password reset
- `resetPassword()` - Complete password reset
- `verifyEmail()` - Email verification (if required)
- Auto token refresh interceptor

### Acceptance Criteria
- [ ] Users can register with email/password
- [ ] Users can login and receive JWT tokens
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Tokens refresh automatically before expiry
- [ ] Users can reset forgotten passwords
- [ ] Session persists across browser refresh (if "remember me")

---

## Phase 2: Dashboard Overview Enhancement
**Priority: High | Estimated Effort: Medium**

### Objectives
- Complete the overview page with real-time data
- Add interactive charts and activity feeds
- Implement quick actions

### Tasks

#### 2.1 Enhanced Stats Cards
```
src/features/dashboard/components/
├── stats-card.tsx                   # ✅ Basic exists
├── stats-grid.tsx                   # NEW: Grid with loading states
└── trend-indicator.tsx              # NEW: Trend arrows with percentages
```

**Enhancements:**
- Sparkline mini-charts in cards
- Click-to-drill-down functionality
- Animated number transitions
- Comparison with previous period

#### 2.2 Activity Charts
```
src/features/dashboard/components/
├── jobs-timeline-chart.tsx          # NEW: Jobs discovered over time
├── source-performance-chart.tsx     # NEW: Source success rates
└── charts/
    ├── area-chart.tsx               # Reusable area chart
    ├── bar-chart.tsx                # Reusable bar chart
    └── donut-chart.tsx              # Reusable donut chart
```

**Implementation:**
- Use `recharts` library (already in dependencies)
- Jobs discovered per day (7-day view)
- Source performance breakdown (pie/donut)
- Scrape success rate over time

#### 2.3 Activity Feed
```
src/features/dashboard/components/
├── activity-feed.tsx                # NEW: Real-time activity log
└── activity-item.tsx                # NEW: Individual activity entry
```

**Features:**
- Recent scrape completions
- New jobs discovered
- Source errors/warnings
- System notifications
- Filterable by type

#### 2.4 Quick Actions Panel
```
src/features/dashboard/components/
└── quick-actions.tsx                # NEW: Common actions panel
```

**Actions:**
- Trigger all scrapers
- Add new source (opens modal)
- View error sources
- Export recent jobs

### Acceptance Criteria
- [ ] Dashboard loads with real API data
- [ ] Charts render with proper data visualization
- [ ] Activity feed shows recent events
- [ ] Quick actions work and provide feedback
- [ ] All components handle loading/error states

---

## Phase 3: Jobs Management
**Priority: High | Estimated Effort: High**

### Objectives
- Complete jobs listing with advanced filtering
- Implement job detail view
- Add job actions (archive, share, export)

### Tasks

#### 3.1 Enhanced Job Filters
```
src/features/jobs/components/
├── job-filters.tsx                  # ✅ Basic exists
├── job-filter-presets.tsx           # NEW: Saved filter presets
├── job-sort-menu.tsx                # NEW: Sort options dropdown
└── job-view-toggle.tsx              # NEW: Grid/List/Table view toggle
```

**Filter Enhancements:**
- Date range picker (first seen, last seen)
- Salary range slider
- Location autocomplete
- Multiple company selection
- Save/load filter presets

#### 3.2 Job Views
```
src/features/jobs/components/
├── job-card.tsx                     # ✅ Grid card exists
├── job-list-item.tsx                # NEW: Compact list row
├── job-table.tsx                    # NEW: Data table view
└── job-table-columns.tsx            # NEW: Column definitions
```

**Views:**
- **Grid View**: Visual cards (current)
- **List View**: Compact rows with key info
- **Table View**: Full data table with sorting

#### 3.3 Job Detail Page
```
src/app/(dashboard)/jobs/[id]/
├── page.tsx                         # Job detail page
├── loading.tsx                      # Loading skeleton
└── not-found.tsx                    # 404 handling
```

```
src/features/jobs/components/
├── job-detail-header.tsx            # Title, company, status
├── job-detail-content.tsx           # Description, requirements
├── job-detail-sidebar.tsx           # Metadata, actions
├── job-detail-timeline.tsx          # History of when job was seen
└── job-similar-jobs.tsx             # Related jobs from same company
```

**Detail Page Features:**
- Full job description rendering (markdown support)
- Requirements list with skill matching
- Application link with tracking
- Job history timeline
- Similar jobs suggestions
- Share/export options

#### 3.4 Job Actions
```
src/features/jobs/components/
├── job-actions-menu.tsx             # NEW: Actions dropdown
└── job-bulk-actions.tsx             # NEW: Bulk selection actions
```

**Actions:**
- Open application URL (with click tracking)
- Copy job link
- Share via email
- Export to PDF
- Archive/hide job
- Mark as applied (future user tracking)

#### 3.5 Job Export
```
src/features/jobs/components/
└── job-export-modal.tsx             # NEW: Export configuration
```

```
src/lib/
└── export.ts                        # Export utilities
```

**Export Options:**
- CSV export (filtered jobs)
- PDF export (single job or batch)
- JSON export (for developers)

### Acceptance Criteria
- [ ] Jobs list with pagination working
- [ ] All filter types functional
- [ ] Three view modes (grid/list/table) working
- [ ] Job detail page shows all information
- [ ] Job actions work (apply, share, export)
- [ ] Bulk actions on multiple jobs
- [ ] Filter presets can be saved/loaded

---

## Phase 4: Source Management
**Priority: High | Estimated Effort: High**

### Objectives
- Complete source CRUD operations
- Implement source detail with scrape history
- Add manual scrape triggering with live feedback

### Tasks

#### 4.1 Add/Edit Source Modal
```
src/features/sources/components/
├── source-form.tsx                  # NEW: Create/Edit form
├── source-form-fields.tsx           # NEW: Form field components
└── source-url-validator.tsx         # NEW: URL validation with preview
```

**Form Fields:**
- Company selection (with create new option)
- Source type (careers page, LinkedIn, etc.)
- Source URL (with validation)
- Scrape frequency
- Scraper configuration (selectors, etc.)
- Active/inactive toggle

#### 4.2 Source Detail Page
```
src/app/(dashboard)/sources/[id]/
├── page.tsx                         # Source detail page
├── loading.tsx
└── not-found.tsx
```

```
src/features/sources/components/
├── source-detail-header.tsx         # Status, last scrape, actions
├── source-detail-stats.tsx          # Jobs found, success rate
├── source-scrape-history.tsx        # Paginated scrape logs
├── source-jobs-preview.tsx          # Recent jobs from this source
└── source-config-panel.tsx          # Configuration display/edit
```

**Detail Features:**
- Source health status
- Scrape history with expandable logs
- Jobs discovered from this source
- Configuration view/edit
- Manual scrape trigger with live progress

#### 4.3 Scrape Logs
```
src/features/sources/components/
├── scrape-log-list.tsx              # NEW: Log entries list
├── scrape-log-item.tsx              # NEW: Single log entry
├── scrape-log-detail.tsx            # NEW: Expanded log details
└── scrape-progress.tsx              # NEW: Live scrape progress
```

**Log Features:**
- Status indicator (success/failed/in-progress)
- Duration and job counts
- Error messages with stack traces
- Expandable detailed output

#### 4.4 Manual Scrape with Live Updates
```
src/hooks/
└── use-scrape-progress.ts           # NEW: WebSocket/polling for progress
```

**Implementation:**
- Trigger scrape via API
- Poll for progress updates (or WebSocket if available)
- Show real-time progress indicator
- Display results when complete

#### 4.5 Source Filters
```
src/features/sources/components/
├── source-filters.tsx               # NEW: Filter bar
└── source-status-filter.tsx         # NEW: Status quick filters
```

**Filters:**
- Search by company/URL
- Filter by status (active, error, paused)
- Filter by source type
- Sort by last scraped, jobs found, etc.

### Acceptance Criteria
- [ ] Sources can be created via modal form
- [ ] Sources can be edited inline or via modal
- [ ] Sources can be deleted with confirmation
- [ ] Source detail page shows full history
- [ ] Manual scrape works with progress feedback
- [ ] Scrape logs are viewable and expandable
- [ ] Source filters work correctly

---

## Phase 5: Company Management
**Priority: Medium | Estimated Effort: Medium**

### Objectives
- Implement full company CRUD
- Add company detail with sources and jobs
- Company logo upload/management

### Tasks

#### 5.1 Company Form Modal
```
src/features/companies/components/
├── company-form.tsx                 # NEW: Create/Edit form
├── company-logo-upload.tsx          # NEW: Logo upload component
└── company-url-input.tsx            # NEW: Careers URL with validation
```

**Form Fields:**
- Company name
- Logo upload (with preview)
- Careers page URL
- Scraper type (static/dynamic/API)
- Default scrape frequency
- Notes/description

#### 5.2 Company Detail Page
```
src/app/(dashboard)/companies/[id]/
├── page.tsx
├── loading.tsx
└── not-found.tsx
```

```
src/features/companies/components/
├── company-detail-header.tsx        # Logo, name, status
├── company-sources-list.tsx         # Sources for this company
├── company-jobs-stats.tsx           # Job statistics
└── company-activity.tsx             # Recent activity
```

#### 5.3 Enhanced Company List
```
src/features/companies/components/
├── company-card.tsx                 # ✅ Basic exists
├── company-list.tsx                 # NEW: Full list component
├── company-table.tsx                # NEW: Table view
└── company-filters.tsx              # NEW: Search/filter
```

### Acceptance Criteria
- [ ] Companies can be created with logo
- [ ] Companies can be edited
- [ ] Company detail shows sources and jobs
- [ ] Company list has search and filters
- [ ] Company deletion cascades properly (with warning)

---

## Phase 6: Settings & User Management
**Priority: Medium | Estimated Effort: Medium**

### Objectives
- Complete user profile management
- Implement notification preferences
- Add system settings (for admins)

### Tasks

#### 6.1 User Profile
```
src/app/(dashboard)/settings/
├── page.tsx                         # ✅ Basic exists
├── profile/page.tsx                 # NEW: Profile settings
├── notifications/page.tsx           # NEW: Notification prefs
├── security/page.tsx                # NEW: Password, sessions
└── appearance/page.tsx              # NEW: Theme settings
```

```
src/features/settings/components/
├── profile-form.tsx                 # Edit name, email, avatar
├── password-change-form.tsx         # Change password
├── notification-preferences.tsx     # Push, email settings
├── active-sessions.tsx              # View/revoke sessions
└── theme-selector.tsx               # Theme customization
```

#### 6.2 Notification Preferences
```
src/features/settings/components/
├── notification-channel-toggle.tsx  # Enable/disable channels
├── notification-frequency.tsx       # Digest frequency
└── notification-filters.tsx         # What to notify about
```

**Settings:**
- Email notifications (on/off)
- Push notifications (on/off)
- Notification frequency (immediate/hourly/daily)
- Job criteria filters (keywords, companies, etc.)

#### 6.3 Admin Settings (if admin role)
```
src/app/(dashboard)/settings/admin/
├── page.tsx                         # Admin overview
├── users/page.tsx                   # User management
└── system/page.tsx                  # System settings
```

### Acceptance Criteria
- [ ] Users can update profile info
- [ ] Users can change password
- [ ] Notification preferences save correctly
- [ ] Theme preference persists
- [ ] Admin can manage users (if applicable)

---

## Phase 7: Real-time Features
**Priority: Medium | Estimated Effort: High**

### Objectives
- Add WebSocket connection for live updates
- Implement real-time notifications
- Add live scrape progress

### Tasks

#### 7.1 WebSocket Setup
```
src/lib/
├── websocket.ts                     # WebSocket client
└── websocket-provider.tsx           # React context for WS
```

```
src/hooks/
├── use-websocket.ts                 # WebSocket hook
├── use-live-jobs.ts                 # Real-time job updates
└── use-live-scrape.ts               # Real-time scrape progress
```

#### 7.2 Live Notifications
```
src/features/notifications/
├── components/
│   ├── notification-bell.tsx        # Header bell with badge
│   ├── notification-dropdown.tsx    # Dropdown list
│   ├── notification-item.tsx        # Single notification
│   └── notification-toast.tsx       # Push notification toast
├── hooks/
│   └── use-notifications.ts         # Notification management
└── stores/
    └── notification-store.ts        # Notification state
```

#### 7.3 Live Dashboard Updates
- New jobs appear in real-time on dashboard
- Stats update without refresh
- Source status changes reflect immediately

### Acceptance Criteria
- [ ] WebSocket connects and maintains connection
- [ ] New jobs appear in real-time
- [ ] Notifications show without refresh
- [ ] Scrape progress updates live
- [ ] Graceful fallback to polling if WS fails

---

## Phase 8: Search & Command Palette
**Priority: Low | Estimated Effort: Medium**

### Objectives
- Implement global search
- Add command palette (⌘K)
- Quick navigation

### Tasks

#### 8.1 Global Search
```
src/features/search/
├── components/
│   ├── search-dialog.tsx            # Search modal
│   ├── search-input.tsx             # Search input with suggestions
│   ├── search-results.tsx           # Results display
│   ├── search-result-item.tsx       # Individual result
│   └── search-filters.tsx           # Result type filters
├── hooks/
│   └── use-search.ts                # Search logic
└── services/
    └── search-service.ts            # Search API
```

**Search Features:**
- Search jobs by title, description
- Search companies by name
- Search sources by URL
- Recent searches
- Search suggestions

#### 8.2 Command Palette
```
src/components/shared/
└── command-palette.tsx              # ⌘K command palette
```

**Commands:**
- Navigate to any page
- Quick search
- Trigger actions (new source, scrape all)
- Toggle theme
- Open settings

### Acceptance Criteria
- [ ] Global search finds jobs, companies, sources
- [ ] Command palette opens with ⌘K
- [ ] Commands execute correctly
- [ ] Search results are relevant and fast

---

## Phase 9: Performance & Polish
**Priority: Low | Estimated Effort: Medium**

### Objectives
- Optimize bundle size and loading
- Add loading skeletons everywhere
- Implement error boundaries
- Add analytics tracking

### Tasks

#### 9.1 Performance Optimization
```
src/lib/
└── lazy.ts                          # Lazy loading utilities
```

- Implement route-based code splitting
- Optimize images with next/image
- Add service worker for caching
- Implement virtual scrolling for long lists

#### 9.2 Error Handling
```
src/app/
├── error.tsx                        # Global error boundary
├── not-found.tsx                    # 404 page
└── (dashboard)/
    └── error.tsx                    # Dashboard error boundary
```

```
src/components/shared/
└── error-boundary.tsx               # Reusable error boundary
```

#### 9.3 Loading States
- Add skeleton loaders to all pages
- Implement Suspense boundaries
- Add page transition animations

#### 9.4 Analytics
```
src/lib/
└── analytics.ts                     # Analytics utilities
```

- Page view tracking
- Event tracking (actions, clicks)
- Error tracking (Sentry integration)

### Acceptance Criteria
- [ ] Lighthouse score > 90
- [ ] All pages have loading skeletons
- [ ] Errors are caught and displayed gracefully
- [ ] Analytics tracking works

---

## Phase 10: Testing & Documentation
**Priority: Low | Estimated Effort: High**

### Objectives
- Add comprehensive test coverage
- Create component documentation
- Write user guide

### Tasks

#### 10.1 Unit Tests
```
src/__tests__/
├── components/                      # Component tests
├── hooks/                           # Hook tests
├── stores/                          # Store tests
└── utils/                           # Utility tests
```

#### 10.2 Integration Tests
```
src/__tests__/integration/
├── auth.test.ts                     # Auth flow tests
├── jobs.test.ts                     # Jobs CRUD tests
└── sources.test.ts                  # Sources CRUD tests
```

#### 10.3 E2E Tests
```
e2e/
├── auth.spec.ts                     # Login/logout flows
├── jobs.spec.ts                     # Jobs management
└── sources.spec.ts                  # Sources management
```

#### 10.4 Documentation
```
docs/
├── components.md                    # Component API docs
├── architecture.md                  # Architecture overview
└── user-guide.md                    # End user documentation
```

### Acceptance Criteria
- [ ] >80% unit test coverage
- [ ] Critical paths have integration tests
- [ ] E2E tests pass on CI
- [ ] Components are documented

---

## Implementation Order Recommendation

### Sprint 1 (Foundation)
1. **Phase 1: Authentication** - Critical for everything else

### Sprint 2 (Core Features)
2. **Phase 3: Jobs Management** - Core user value
3. **Phase 4: Source Management** - Admin functionality

### Sprint 3 (Enhancement)
4. **Phase 2: Dashboard Enhancement** - Better UX
5. **Phase 5: Company Management** - Complete CRUD

### Sprint 4 (Polish)
6. **Phase 6: Settings** - User preferences
7. **Phase 8: Search** - Productivity boost

### Sprint 5 (Advanced)
8. **Phase 7: Real-time** - Live updates
9. **Phase 9: Performance** - Optimization

### Ongoing
10. **Phase 10: Testing** - Throughout development

---

## File Checklist Summary

### New Files to Create
```
Total new files: ~60

Authentication:        5 files
Dashboard:           10 files
Jobs:                15 files
Sources:             12 files
Companies:            8 files
Settings:             8 files
Real-time:            6 files
Search:               8 files
Testing:            ~30 files
```

### Existing Files to Enhance
```
- src/stores/auth-store.ts
- src/services/auth-service.ts
- src/features/dashboard/components/*
- src/features/jobs/components/*
- src/features/sources/components/*
- src/app/(dashboard)/*/page.tsx
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "recharts": "^2.12.0",           // Charts (if not already added)
    "date-fns": "^3.3.0",            // Date manipulation
    "zod": "^3.22.0",                // Form validation
    "react-hook-form": "^7.50.0",    // Form management
    "@hookform/resolvers": "^3.3.0", // Zod resolver
    "cmdk": "^0.2.0",                // Command palette
    "socket.io-client": "^4.7.0"     // WebSocket client
  },
  "devDependencies": {
    "vitest": "^1.2.0",              // Unit testing
    "@testing-library/react": "^14.2.0",
    "playwright": "^1.41.0",         // E2E testing
    "@playwright/test": "^1.41.0"
  }
}
```

---

## Notes

1. **API Dependency**: Many features depend on backend API endpoints. Coordinate with backend development.

2. **Incremental Delivery**: Each phase can be released independently. Prioritize based on user feedback.

3. **Mobile Responsiveness**: Ensure all components work on tablet/mobile (dashboard is secondary to mobile app, but should still work).

4. **Accessibility**: Follow WCAG 2.1 AA guidelines. Use semantic HTML and ARIA labels.

5. **Error States**: Every component should handle loading, empty, and error states gracefully.
