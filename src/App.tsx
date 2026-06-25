import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GuestProvider } from './contexts/GuestContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { AuthCallback } from './pages/AuthCallback';
import { NotFoundPage } from './pages/NotFound';
import { GuestRoute } from './components/GuestRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExamLayout } from './features/exam/components/ExamLayout';
import { ExamHome, CreateTest, SavedTests, PlayTest, PlayTestShared, BrowsePublishedTests, AttemptHistory } from './features/exam';
import { StudyGroupsLayout, StudyGroupsHome, MyGroupsPage, CreateGroupPage } from './features/study-groups';
import { ToastProvider } from './components/ui/Toast';

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
                        <DashboardPage />
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
                        <ExamLayout>
                          <ExamHome />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/create"
                    element={
                      <GuestRoute>
                        <ExamLayout>
                          <CreateTest />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/saved"
                    element={
                      <GuestRoute>
                        <ExamLayout>
                          <SavedTests />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/play/:id"
                    element={
                      <GuestRoute>
                        <ExamLayout>
                          <PlayTest />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/shared/:id"
                    element={
                      <GuestRoute>
                        <ExamLayout>
                          <PlayTestShared />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/browse"
                    element={
                      <GuestRoute>
                        <ExamLayout>
                          <BrowsePublishedTests />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/exam/attempts"
                    element={
                      <GuestRoute>
                        <ExamLayout>
                          <AttemptHistory />
                        </ExamLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/study-groups"
                    element={
                      <GuestRoute>
                        <StudyGroupsLayout>
                          <StudyGroupsHome />
                        </StudyGroupsLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/study-groups/my"
                    element={
                      <GuestRoute>
                        <StudyGroupsLayout>
                          <MyGroupsPage />
                        </StudyGroupsLayout>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/dashboard/study-groups/create"
                    element={
                      <GuestRoute>
                        <StudyGroupsLayout>
                          <CreateGroupPage />
                        </StudyGroupsLayout>
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
