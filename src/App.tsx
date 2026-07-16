import { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GuestProvider } from './contexts/GuestContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from './lib/queryClient';
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { NotFoundPage } from './pages/NotFound';
import { GuestRoute } from './components/GuestRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExamLayout } from './features/exam/components/ExamLayout';
import { StudyGroupsLayout } from './features/study-groups/components/StudyGroupsLayout';
import { ScheduleExtractionLayout } from './features/schedule-extraction';
import { CoursesLayout } from './features/courses';
import { SubjectsLayout } from './features/subjects';
import { DashboardLayout } from './pages/Dashboard/DashboardLayout';
import { ToastProvider } from './components/ui/Toast';
import { AdminGuard } from './components/guards/AdminGuard';
import { AdminLayout } from './pages/Admin/AdminLayout';

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-cyan-400 text-lg">جاري التحميل...</div>
  </div>
);

const withRouteShell = (element: React.ReactNode) => (
  <GuestRoute>
    <Suspense fallback={<RouteLoader />}>
      {element}
    </Suspense>
  </GuestRoute>
);

const LazyDashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));

const LazyExamHome = lazy(() => import('./features/exam').then(m => ({ default: m.ExamHome })));
const LazyCreateTest = lazy(() => import('./features/exam').then(m => ({ default: m.CreateTest })));
const LazySavedTests = lazy(() => import('./features/exam').then(m => ({ default: m.SavedTests })));
const LazyPlayTest = lazy(() => import('./features/exam').then(m => ({ default: m.PlayTest })));
const LazyPlayTestShared = lazy(() => import('./features/exam').then(m => ({ default: m.PlayTestShared })));
const LazyBrowsePublishedTests = lazy(() => import('./features/exam').then(m => ({ default: m.BrowsePublishedTests })));
const LazyAttemptHistory = lazy(() => import('./features/exam').then(m => ({ default: m.AttemptHistory })));

const LazyStudyGroupsHome = lazy(() => import('./features/study-groups/src/pages/StudyGroupsHome').then(m => ({ default: m.default })));
const LazyMyGroupsPage = lazy(() => import('./features/study-groups/src/pages/MyGroupsPage').then(m => ({ default: m.default })));
const LazyCreateGroupPage = lazy(() => import('./features/study-groups/src/pages/CreateGroupPage').then(m => ({ default: m.default })));

const LazyScheduleExtractionPage = lazy(() => import('./features/schedule-extraction').then(m => ({ default: m.ScheduleExtractionPage })));
const LazyCoursesHome = lazy(() => import('./features/courses').then(m => ({ default: m.CoursesHome })));
const LazySubjectsHome = lazy(() => import('./features/subjects').then(m => ({ default: m.SubjectsHome })));
const LazySubjectDetailPage = lazy(() => import('./features/subjects').then(m => ({ default: m.SubjectDetailPage })));
const LazyAnalyticsPage = lazy(() => import('./pages/Analytics').then(m => ({ default: m.AnalyticsPage })));
const LazyVerificationPanel = lazy(() => import('./pages/Admin/VerificationPanel').then(m => ({ default: m.VerificationPanel })));
const LazyUserManagement = lazy(() => import('./pages/Admin/UserManagement').then(m => ({ default: m.UserManagement })));
const LazyExtractionTracking = lazy(() => import('./pages/Admin/ExtractionTracking').then(m => ({ default: m.ExtractionTracking })));
const LazyReports = lazy(() => import('./pages/Admin/Reports').then(m => ({ default: m.Reports })));

function App() {
  const [queryClient] = useState(() => createQueryClient());

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
                      withRouteShell(<LazyDashboardPage />)
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
                      withRouteShell(
                        <ExamLayout>
                          <LazyExamHome />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/exam/create"
                    element={
                      withRouteShell(
                        <ExamLayout>
                          <LazyCreateTest />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/exam/saved"
                    element={
                      withRouteShell(
                        <ExamLayout>
                          <LazySavedTests />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/exam/play/:id"
                    element={
                      withRouteShell(
                        <ExamLayout>
                          <LazyPlayTest />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/exam/shared/:id"
                    element={
                      withRouteShell(
                        <ExamLayout>
                          <LazyPlayTestShared />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/exam/browse"
                    element={
                      withRouteShell(
                        <ExamLayout>
                          <LazyBrowsePublishedTests />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/exam/attempts"
                    element={
                      withRouteShell(
                        <ExamLayout>
                          <LazyAttemptHistory />
                        </ExamLayout>
                      )
                    }
                  />
                  <Route
                    path="/dashboard/study-groups"
                    element={
                      withRouteShell(
                        <StudyGroupsLayout>
                          <LazyStudyGroupsHome />
                        </StudyGroupsLayout>
                      )
                    }
                  />
                  <Route
                    path="/dashboard/study-groups/my"
                    element={
                      withRouteShell(
                        <StudyGroupsLayout>
                          <LazyMyGroupsPage />
                        </StudyGroupsLayout>
                      )
                    }
                  />
                  <Route
                    path="/dashboard/study-groups/create"
                    element={
                      withRouteShell(
                        <StudyGroupsLayout>
                          <LazyCreateGroupPage />
                        </StudyGroupsLayout>
                      )
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
                      withRouteShell(
                        <ScheduleExtractionLayout>
                          <LazyScheduleExtractionPage />
                        </ScheduleExtractionLayout>
                      )
                    }
                  />
                   <Route
                     path="/dashboard/courses"
                     element={
                       withRouteShell(
                         <CoursesLayout>
                           <LazyCoursesHome />
                         </CoursesLayout>
                       )
                     }
                   />
                   <Route
                     path="/dashboard/subjects"
                     element={
                       withRouteShell(
                         <SubjectsLayout>
                           <LazySubjectsHome />
                         </SubjectsLayout>
                       )
                     }
                   />
                     <Route
                       path="/dashboard/subjects/:courseCode"
                       element={
                         withRouteShell(
                           <SubjectsLayout>
                             <LazySubjectDetailPage />
                           </SubjectsLayout>
                         )
                       }
                     />
                      <Route
                        path="/admin"
                        element={
                          <AdminGuard>
                            <AdminLayout />
                          </AdminGuard>
                        }
                      >
                        <Route
                          path="users"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <LazyUserManagement />
                            </Suspense>
                          }
                        />
                        <Route
                          path="extractions"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <LazyExtractionTracking />
                            </Suspense>
                          }
                        />
                        <Route
                          path="reports"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <LazyReports />
                            </Suspense>
                          }
                        />
                        <Route
                          path="verification"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <LazyVerificationPanel />
                            </Suspense>
                          }
                        />
                        <Route
                          path="analytics"
                          element={
                            <Suspense fallback={<RouteLoader />}>
                              <LazyAnalyticsPage />
                            </Suspense>
                          }
                        />
                        <Route index element={<Navigate to="users" replace />} />
                      </Route>
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
