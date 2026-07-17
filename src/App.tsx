import { useState, Suspense, lazy, useEffect } from 'react';
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
import { ToastProvider } from './components/ui/Toast';
import { AdminGuard } from './components/guards/AdminGuard';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const RouteLoader = () => {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isSlow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-cyan-400 text-lg">جاري التحميل...</p>
        <p className="text-slate-400 text-sm">يستغرق التحميل وقتاً أطول من المعتاد</p>
        <button
          type="button"
          className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm transition-colors"
          onClick={() => window.location.reload()}
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      <p className="text-cyan-400 text-lg">جاري التحميل...</p>
    </div>
  );
};

const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<RouteLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const withRouteShell = (element: React.ReactNode) => (
  <GuestRoute>
    <LazyRoute>
      {element}
    </LazyRoute>
  </GuestRoute>
);

const examFeature = () => import('./features/exam').then(m => m);

const LazyDashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const LazyReviewsPage = lazy(() => import('./pages/Dashboard/Reviews').then(m => ({ default: m.ReviewsPage })));

const LazyExamHome = lazy(() => examFeature().then(m => ({ default: m.ExamHome })));
const LazyCreateTest = lazy(() => examFeature().then(m => ({ default: m.CreateTest })));
const LazySavedTests = lazy(() => examFeature().then(m => ({ default: m.SavedTests })));
const LazyPlayTest = lazy(() => examFeature().then(m => ({ default: m.PlayTest })));
const LazyPlayTestShared = lazy(() => examFeature().then(m => ({ default: m.PlayTestShared })));
const LazyBrowsePublishedTests = lazy(() => examFeature().then(m => ({ default: m.BrowsePublishedTests })));
const LazyAttemptHistory = lazy(() => examFeature().then(m => ({ default: m.AttemptHistory })));

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
const LazyNotificationManagement = lazy(() => import('./pages/Admin/NotificationManagement').then(m => ({ default: m.NotificationManagement })));
const LazyReviews = lazy(() => import('./pages/Admin/Reviews').then(m => ({ default: m.Reviews })));
const LazySemesterTransitionPage = lazy(() => import('./pages/Admin/SemesterTransitionPage').then(m => ({ default: m.SemesterTransitionPage })));

const LazyExamLayout = lazy(() => import('./features/exam/components/ExamLayout').then(m => ({ default: m.ExamLayout })));
const LazyStudyGroupsLayout = lazy(() => import('./features/study-groups/components/StudyGroupsLayout').then(m => ({ default: m.StudyGroupsLayout })));
const LazyScheduleExtractionLayout = lazy(() => import('./features/schedule-extraction').then(m => ({ default: m.ScheduleExtractionLayout })));
const LazyCoursesLayout = lazy(() => import('./features/courses').then(m => ({ default: m.CoursesLayout })));
const LazySubjectsLayout = lazy(() => import('./features/subjects').then(m => ({ default: m.SubjectsLayout })));
const LazyMyReferencesPage = lazy(() => import('./features/subjects').then(m => ({ default: m.MyReferencesPage })));
const LazyAdminLayout = lazy(() => import('./pages/Admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const LazySourcesManagement = lazy(() => import('./pages/Admin/SourcesManagement').then(m => ({ default: m.SourcesManagement })));

function App() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuestProvider>
          <ToastProvider>
            <Router>
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
                  path="/dashboard/reviews"
                  element={
                    <ProtectedRoute>
                      <LazyReviewsPage />
                    </ProtectedRoute>
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
                      <LazyExamLayout>
                        <LazyExamHome />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/exam/create"
                  element={
                    withRouteShell(
                      <LazyExamLayout>
                        <LazyCreateTest />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/exam/saved"
                  element={
                    withRouteShell(
                      <LazyExamLayout>
                        <LazySavedTests />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/exam/play/:id"
                  element={
                    withRouteShell(
                      <LazyExamLayout>
                        <LazyPlayTest />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/exam/shared/:id"
                  element={
                    withRouteShell(
                      <LazyExamLayout>
                        <LazyPlayTestShared />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/exam/browse"
                  element={
                    withRouteShell(
                      <LazyExamLayout>
                        <LazyBrowsePublishedTests />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/exam/attempts"
                  element={
                    withRouteShell(
                      <LazyExamLayout>
                        <LazyAttemptHistory />
                      </LazyExamLayout>
                    )
                  }
                />
                <Route
                  path="/dashboard/study-groups"
                  element={
                    withRouteShell(
                      <LazyStudyGroupsLayout>
                        <LazyStudyGroupsHome />
                      </LazyStudyGroupsLayout>
                    )
                  }
                />
                <Route
                  path="/dashboard/study-groups/my"
                  element={
                    withRouteShell(
                      <LazyStudyGroupsLayout>
                        <LazyMyGroupsPage />
                      </LazyStudyGroupsLayout>
                    )
                  }
                />
                <Route
                  path="/dashboard/study-groups/create"
                  element={
                    withRouteShell(
                      <LazyStudyGroupsLayout>
                        <LazyCreateGroupPage />
                      </LazyStudyGroupsLayout>
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
                      <LazyScheduleExtractionLayout>
                        <LazyScheduleExtractionPage />
                      </LazyScheduleExtractionLayout>
                    )
                  }
                />
                 <Route
                  path="/dashboard/courses"
                  element={
                    withRouteShell(
                      <LazyCoursesLayout>
                        <LazyCoursesHome />
                      </LazyCoursesLayout>
                    )
                  }
                />
                 <Route
                  path="/dashboard/subjects"
                  element={
                    withRouteShell(
                      <LazySubjectsLayout>
                        <LazySubjectsHome />
                      </LazySubjectsLayout>
                    )
                  }
                />
                   <Route
                      path="/dashboard/subjects/:courseCode"
                      element={
                        withRouteShell(
                          <LazySubjectsLayout>
                            <LazySubjectDetailPage />
                          </LazySubjectsLayout>
                        )
                      }
                    />
                    <Route
                      path="/dashboard/subjects/my"
                      element={
                        withRouteShell(
                          <LazySubjectsLayout>
                            <LazyMyReferencesPage />
                          </LazySubjectsLayout>
                        )
                      }
                    />
                     <Route
                       path="/admin"
                       element={
                         <LazyRoute>
                           <AdminGuard>
                             <LazyAdminLayout />
                           </AdminGuard>
                         </LazyRoute>
                       }
                     >
                      <Route
                        path="users"
                        element={
                          <LazyRoute>
                            <LazyUserManagement />
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="extractions"
                        element={
                          <LazyRoute>
                            <LazyExtractionTracking />
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="reports"
                        element={
                          <LazyRoute>
                            <LazyReports />
                          </LazyRoute>
                        }
                      />
                      <Route
                        path="verification"
                        element={
                          <LazyRoute>
                            <LazyVerificationPanel />
                          </LazyRoute>
                        }
                      />
                       <Route
                         path="reviews"
                         element={
                           <LazyRoute>
                             <LazyReviews />
                           </LazyRoute>
                         }
                       />
                        <Route
                          path="notifications"
                          element={
                            <LazyRoute>
                              <LazyNotificationManagement />
                            </LazyRoute>
                          }
                        />
                        <Route
                          path="analytics"
                          element={
                            <LazyRoute>
                              <LazyAnalyticsPage />
                            </LazyRoute>
                          }
                        />
                       <Route
                         path="semester"
                         element={
                           <LazyRoute>
                             <LazySemesterTransitionPage />
                           </LazyRoute>
                         }
                       />
                       <Route
                         path="sources"
                         element={
                           <LazyRoute>
                             <LazySourcesManagement />
                           </LazyRoute>
                         }
                       />
                       <Route index element={<Navigate to="users" replace />} />
                    </Route>
                   <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </ToastProvider>
        </GuestProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
