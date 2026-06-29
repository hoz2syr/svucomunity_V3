import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { GuestProvider } from './contexts/GuestContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { NotFoundPage } from './pages/NotFound';
import { GuestRoute } from './components/GuestRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExamLayout } from './features/exam/components/ExamLayout';
import { StudyGroupsLayout } from './features/study-groups';
import { ScheduleExtractionLayout } from './features/schedule-extraction';
import { ToastProvider } from './components/ui/Toast';

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-cyan-400 text-lg">جاري التحميل...</div>
  </div>
);

const LazyDashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));

const LazyExamHome = lazy(() => import('./features/exam').then(m => ({ default: m.ExamHome })));
const LazyCreateTest = lazy(() => import('./features/exam').then(m => ({ default: m.CreateTest })));
const LazySavedTests = lazy(() => import('./features/exam').then(m => ({ default: m.SavedTests })));
const LazyPlayTest = lazy(() => import('./features/exam').then(m => ({ default: m.PlayTest })));
const LazyPlayTestShared = lazy(() => import('./features/exam').then(m => ({ default: m.PlayTestShared })));
const LazyBrowsePublishedTests = lazy(() => import('./features/exam').then(m => ({ default: m.BrowsePublishedTests })));
const LazyAttemptHistory = lazy(() => import('./features/exam').then(m => ({ default: m.AttemptHistory })));

const LazyStudyGroupsHome = lazy(() => import('./features/study-groups').then(m => ({ default: m.StudyGroupsHome })));
const LazyMyGroupsPage = lazy(() => import('./features/study-groups').then(m => ({ default: m.MyGroupsPage })));
const LazyCreateGroupPage = lazy(() => import('./features/study-groups').then(m => ({ default: m.CreateGroupPage })));

const LazyScheduleExtractionPage = lazy(() => import('./features/schedule-extraction').then(m => ({ default: m.ScheduleExtractionPage })));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuestProvider>
          <ToastProvider>
            <Router>
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route
                    path="/dashboard"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <LazyDashboardPage />
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam"
                    element={
                      <GuestRoute>
                        <Navigate to="/exam/saved" replace />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/home"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazyExamHome />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/create"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazyCreateTest />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/saved"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazySavedTests />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/play/:id"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazyPlayTest />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/shared/:id"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazyPlayTestShared />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/browse"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazyBrowsePublishedTests />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/attempts"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ExamLayout>
                            <LazyAttemptHistory />
                          </ExamLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/study-groups"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <StudyGroupsLayout>
                            <LazyStudyGroupsHome />
                          </StudyGroupsLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/study-groups/my"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <StudyGroupsLayout>
                            <LazyMyGroupsPage />
                          </StudyGroupsLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/study-groups/create"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <StudyGroupsLayout>
                            <LazyCreateGroupPage />
                          </StudyGroupsLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                   <Route
                    path="/study-groups"
                    element={
                      <GuestRoute>
                        <Navigate to="/dashboard/study-groups" replace />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/schedule"
                    element={
                      <GuestRoute>
                        <Suspense fallback={<RouteLoader />}>
                          <ScheduleExtractionLayout>
                            <LazyScheduleExtractionPage />
                          </ScheduleExtractionLayout>
                        </Suspense>
                      </GuestRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </ErrorBoundary>
            </Router>
          </ToastProvider>
        </GuestProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
