# Frontend Checklist

## Architecture
- [x] React + TypeScript + Vite
- [x] React Router
- [x] AuthProvider
- [x] GuestRoute (active — all public routes)
- [x] ProtectedRoute (reserved — Study Groups feature)
- [x] ErrorBoundary
- [x] QueryClientProvider (TanStack Query)

## Exam Feature (features/exam)
- [x] ExamLayout + ExamNavbar
- [x] Home (prompt builder)
- [x] CreateTest (JSON upload/paste)
- [x] SavedTests (grid + actions)
- [x] PlayTest (timer + feedback modes)
- [x] PDF export (html2pdf.js)
- [x] Word export (docx)
- [x] TestCard component
- [x] Skeletons + ErrorState + Loading
- [x] Vitest coverage (hooks + utils + components)
- [x] localStorage CRUD (store.ts)
- [x] BACKEND_SCHEMA.md migration plan

## Components
- [x] Layout: Navbar, Footer, Header
- [x] UI primitives: GlassCard, Skeleton, FadeIn, AuthButton, InputField, ServerError
- [x] Auth: AuthCard, ForgotPasswordModal, GuestButton
- [x] Dashboard shell: DashboardLayout, DashboardHeader, EmptyDashboardState
- [x] Dashboard cards: FeatureCard, StudyGroupsCard, CourseMaterialsCard, ScheduleExtractionCard, TestsCard
- [x] Modals: SettingsModal, LogoutModal, DeleteAccountModal
- [x] Landing sections (7 sections)
- [x] Interactive map simulation
- [x] Exam components (TestCard, Skeletons, ErrorState)

## Data Layer
- [x] Supabase client (src/lib/supabase.ts)
- [x] Auth service
- [x] Profile service
- [x] Notification service
- [x] Account service
- [x] Environment service
- [x] localStorage (exam feature)

## Design
- [x] Dark theme (#060a1f base)
- [x] Glassmorphism
- [x] Motion (framer-motion)
- [x] RTL support
- [x] Reduced motion support
- [ ] Central design tokens (planned)
- [ ] Full accessibility audit

## Testing
- [x] Vitest configured
- [x] Storybook setup
- [x] Exam feature tests (store, hooks, components, utils)
- [x] Auth tests
- [x] Dashboard tests
- [x] Services tests
- [ ] Landing section tests (partial)
- [ ] ErrorBoundary tests
- [ ] Full integration tests

## Dashboard Content
- [x] EmptyDashboardState with 4 feature cards
- [x] Guest mode (no auth required)
- [ ] Real groups page
- [ ] Real courses page
- [ ] Real schedule page
- [ ] Real tests page (exam feature exists separately)
- [ ] Real interactive map data

## Known Issues
- [ ] Zustand stores unused (notificationStore, uiStore)
- [ ] TanStack Query configured but underutilized
- [ ] features/*/services/index.ts re-exports only
- [ ] rateLimit.ts.spec.ts not in vitest include pattern
