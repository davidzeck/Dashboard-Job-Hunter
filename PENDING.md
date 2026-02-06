# Job Scout Dashboard - Pending Items

## Pages Not Yet Implemented

### `/scrape-logs` (Medium Priority)
- View scraping history and logs
- Filter by source, status, date range
- Show error details and retry options
- Directory exists but no page.tsx

### `/analytics` (Low Priority)
- Advanced analytics dashboard
- Job market trends
- Application success rates
- Source performance metrics

---

## Phase 7: Real-time Features (Requires Backend WebSocket)

- [ ] WebSocket connection for live updates
- [ ] Real-time job notifications
- [ ] Live scrape progress indicators
- [ ] Online/offline status indicator
- [ ] Toast notifications for new jobs

---

## Phase 10: Testing & Documentation

### Testing
- [ ] Unit tests with Jest/Vitest
- [ ] Component tests with React Testing Library
- [ ] Integration tests for hooks
- [ ] E2E tests with Playwright or Cypress
- [ ] Test coverage reporting

### Documentation
- [ ] API documentation
- [ ] Component Storybook
- [ ] README with setup instructions
- [ ] Contributing guidelines

---

## Nice-to-Have Enhancements

### Jobs Page
- [ ] Bulk actions (export to CSV, archive multiple)
- [ ] Advanced filtering (salary range slider, date posted)
- [ ] Saved searches/filters
- [ ] Job comparison view
- [ ] Application tracking integration

### Sources Page
- [ ] Bulk scrape with progress
- [ ] Source health dashboard
- [ ] Scrape scheduling UI
- [ ] Source templates for common job boards

### Settings Page
- [ ] Email digest configuration
- [ ] Notification schedule
- [ ] Data export (full account)
- [ ] Account deletion flow

### General
- [ ] Mobile-responsive improvements
- [ ] PWA support (offline mode)
- [ ] Keyboard shortcuts help modal
- [ ] Onboarding tour for new users
- [ ] Dark/light/system theme with proper persistence

---

## Technical Debt

- [ ] Chart width warnings during SSG (cosmetic, works at runtime)
- [ ] Some pages could use the new skeleton/empty-state components
- [ ] Test coverage is 0%
- [ ] Bundle size optimization (currently ~128KB for overview page)
- [ ] Image optimization for company logos

---

## Completed Phases

- [x] Phase 1-5: Core Infrastructure
- [x] Phase 6: Settings & User Management
- [x] Phase 8: Search & Command Palette (Cmd+K)
- [x] Phase 9: Performance & Polish (Error boundaries, skeletons, empty states)

---

## Notes

- Demo mode works without backend (`NEXT_PUBLIC_DEMO_MODE=true`)
- All services have mock implementations in `src/services/mock-api-service.ts`
- Mock data focuses on Kenya/East Africa tech companies
