import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@svu-community/ui';
import { BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { useGroupActions } from '@/hooks/useGroupActions';
import { useFileUpload } from '@/hooks/useFileUpload';
import { LandingPage } from '@/components/LandingPage';
import { AppHeader } from '@/components/AppHeader';
import { AppTabs } from '@/components/AppTabs';
import { AuthLoader } from '@/components/AuthLoader';
import type { User, Profile } from '@svu-community/types';

const UploadTab = lazy(() => import('@/components/UploadTab').then(m => ({ default: m.UploadTab })));
const ResultsTab = lazy(() => import('@/components/ResultsTab').then(m => ({ default: m.ResultsTab })));
import type { ExtractionResult, Course } from '@/services/types';

type AppUser = (User | Profile) & {
  display_name?: string | null;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};

export default function App() {
  const { user, isAuthReady, error, setError, signInWithGoogle, logout: authLogout } = useAuth();
  const typedUser = (user as AppUser | null);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

  const courseCodes = useMemo(
    () => extractionResult?.courses.map(c => c.code) ?? [],
    [extractionResult]
  );

  const { availableGroups, fetchError, hasMore, isLoadingMore, loadMore } = useStudyGroups({
    courseCodes,
    enabled: !!extractionResult && courseCodes.length > 0,
  });

  const { joinGroup, leaveGroup, createGroup, isAnyLoading } = useGroupActions();

  const { isUploading, handleFileUpload } = useFileUpload(
    useCallback((result: ExtractionResult) => {
      setExtractionResult(result);
      setActiveTab('results');
    }, []),
    useCallback((message: string | null) => {
      setError(message);
    }, [setError])
  );

  const handleLogin = useCallback(async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Failed to sign in with Google.');
    }
  }, [setError, signInWithGoogle]);

  const handleLogout = useCallback(() => {
    authLogout();
  }, [authLogout]);

  const handleReupload = useCallback(() => {
    setExtractionResult(null);
    setActiveTab('upload');
  }, []);

  const handleJoinGroup = useCallback((groupId: string, currentMembers: string[]) => {
    if (!typedUser) return;
    joinGroup({
      groupId,
      userId: typedUser.id,
      currentMembers,
      onError: (message: string) => setError(message),
    });
  }, [typedUser, joinGroup, setError]);

  const handleLeaveGroup = useCallback((groupId: string, currentMembers: string[]) => {
    if (!typedUser) return;
    leaveGroup({
      groupId,
      userId: typedUser.id,
      currentMembers,
      onError: (message: string) => setError(message),
    });
  }, [typedUser, leaveGroup, setError]);

  const handleCreateGroup = useCallback((course: Course) => {
    if (!typedUser) return;
    createGroup({
      course,
      userId: typedUser.id,
      onError: (message: string) => setError(message),
    });
  }, [typedUser, createGroup, setError]);

  const displayError = useMemo(() => error || fetchError, [error, fetchError]);

  if (!isAuthReady) {
    return <AuthLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <AppHeader user={typedUser} onLogin={handleLogin} onLogout={handleLogout} />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            {!user ? (
              <LandingPage key="landing" onLogin={handleLogin} />
            ) : (
              <motion.div
                key="app-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AppTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  hasResult={!!extractionResult}
                />
                {activeTab === 'upload' ? (
                  <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading...</div>}>
                    <UploadTab
                      key="upload"
                      isUploading={isUploading}
                      error={error}
                      onFileUpload={handleFileUpload}
                    />
                  </Suspense>
                ) : (
                  <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading...</div>}>
                    <ResultsTab
                      key="results"
                      extractionResult={extractionResult}
                      availableGroups={availableGroups}
                       user={typedUser}
                      error={displayError}
                      isActionLoading={isAnyLoading}
                      onJoinGroup={handleJoinGroup}
                      onLeaveGroup={handleLeaveGroup}
                      onCreateGroup={handleCreateGroup}
                      onReupload={handleReupload}
                      hasMore={hasMore}
                      isLoadingMore={isLoadingMore}
                      onLoadMore={loadMore}
                    />
                  </Suspense>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="border-t border-slate-100 py-12 bg-white mt-20">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <BookOpen className="text-indigo-600 w-5 h-5" aria-hidden="true" />
              <span className="font-bold text-slate-900">UniSync</span>
            </div>
            <p className="text-slate-500 text-sm">
              &copy; 2026 UniSync Platform. Powered by Google AI.
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
