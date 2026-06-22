import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GuestProvider } from './contexts/GuestContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Home } from './pages/Home';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { DashboardLayout } from './pages/Dashboard/DashboardLayout';
import { AuthCallback } from './pages/AuthCallback';
import { NotFoundPage } from './pages/NotFound';
import { GuestRoute } from './components/GuestRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExamLayout } from './features/exam/components/ExamLayout';
import { ExamHome, CreateTest, SavedTests, PlayTest, PlayTestShared, BrowsePublishedTests } from './features/exam';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuestProvider>
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
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </Router>
        </GuestProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
