/**
 * UniSync — Schedule Matcher App
 * تم تقسيمه إلى مكونات/hooks منفصلة للقابلية للصيانة
 * ════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  supabase,
  signInWithGoogle,
  signOut,
  onAuthStateChanged,
} from './services/supabase';
import type { UserProfile, Course, StudyGroup, ExtractionResult } from './services/types';
import { extractScheduleFromImage } from './services/gemini';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { cn } from '@/lib/utils';
import {
  Upload,
  BookOpen,
  Users,
  Plus,
  AlertCircle,
  Loader2,
  LogOut,
  Search,
  UserPlus,
  UserMinus,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ───────────────────────────────────────────────────
interface UseAuthReturn {
  user: UserProfile | null;
  isAuthReady: boolean;
  error: string | null;
  setError: (message: string | null) => void;
}

interface UseStudyGroupsOptions {
  courseCodes: string[];
  enabled: boolean;
}

interface UseStudyGroupsReturn {
  availableGroups: Record<string, StudyGroup[]>;
  fetchError: string | null;
}

interface JoinGroupOptions {
  groupId: string;
  currentMembers: string[];
  onError: (message: string) => void;
}

interface LeaveGroupOptions {
  groupId: string;
  currentMembers: string[];
  onError: (message: string) => void;
}

interface CreateGroupOptions {
  course: Course;
  userId: string;
  onError: (message: string) => void;
}

// ─── Auth Hook ───────────────────────────────────────────────
function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, _setError] = useState<string | null>(null);

  const setError = useCallback((message: string | null) => {
    _setError(message);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(async (supabaseUser) => {
      if (!isMounted) return;

      if (supabaseUser) {
        try {
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('[Auth] Failed to fetch user profile:', fetchError);
            if (isMounted) {
              setError('Failed to load user profile. Please try again.');
              setIsAuthReady(true);
            }
            return;
          }

          if (existingUser) {
            if (isMounted) {
              setUser({
                uid: existingUser.id,
                displayName: `${existingUser.first_name} ${existingUser.last_name}`.trim() || existingUser.username,
                email: existingUser.email,
                major: existingUser.major,
                photoURL: existingUser.avatar_url,
                createdAt: existingUser.created_at,
              });
            }
          } else {
            const meta = supabaseUser.user_metadata || {};
            const newUser = {
              id: supabaseUser.id,
              username: meta.preferred_username || supabaseUser.email?.split('@')[0] || 'user',
              first_name: meta.given_name || (meta.name ? meta.name.split(' ')[0] : ''),
              middle_name: '',
              last_name: meta.family_name || (meta.name ? meta.name.split(' ').slice(1).join(' ') : ''),
              email: supabaseUser.email || '',
              major: '',
              avatar_url: meta.avatar_url || meta.picture || '',
            };

            const { error: insertError } = await supabase
              .from('users')
              .insert(newUser);

            if (insertError) {
              console.error('[Auth] Failed to create user profile:', insertError);
              if (isMounted) {
                setError('Failed to create user profile. Please try again.');
              }
            } else if (isMounted) {
              setUser({
                uid: supabaseUser.id,
                displayName: `${newUser.first_name} ${newUser.last_name}`.trim() || newUser.username,
                email: newUser.email,
                major: newUser.major,
                photoURL: newUser.avatar_url,
                createdAt: new Date().toISOString(),
              });
            }
          }
        } catch (err) {
          console.error('[Auth] Error during auth state change:', err);
          if (isMounted) {
            setError('Authentication error. Please try signing in again.');
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }

      if (isMounted) {
        setIsAuthReady(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setError]);

  return { user, isAuthReady, error, setError };
}

// ─── Study Groups Hook ───────────────────────────────────────
function useStudyGroups({ courseCodes, enabled }: UseStudyGroupsOptions): UseStudyGroupsReturn {
  const [availableGroups, setAvailableGroups] = useState<Record<string, StudyGroup[]>>({});
  const [fetchError, setFetchError] = useState<string | null>(null);

  const uniqueCourseCodes = useMemo(
    () => Array.from(new Set(courseCodes)),
    [courseCodes]
  );

  useEffect(() => {
    if (!enabled || uniqueCourseCodes.length === 0) {
      setAvailableGroups({});
      setFetchError(null);
      return;
  }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    const fetchGroups = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('study_groups')
          .select('*')
          .in('course_code', uniqueCourseCodes);

        if (fetchError) {
          console.error('[Supabase] Error fetching study groups:', fetchError);
          if (isMounted) {
            setFetchError('Failed to load study groups. Please try again.');
          }
          return;
        }

        if (!isMounted) return;

        const groups: Record<string, StudyGroup[]> = {};
        (data || []).forEach((row) => {
          const group: StudyGroup = {
            id: row.id,
            courseCode: row.course_code,
            courseName: row.course_name,
            name: row.name,
            description: row.description,
            creatorId: row.creator_id,
            members: row.members || [],
            createdAt: row.created_at,
          };
          if (!groups[group.courseCode]) groups[group.courseCode] = [];
          groups[group.courseCode].push(group);
        });

        setAvailableGroups(groups);
        setFetchError(null);
      } catch (err) {
        console.error('[Supabase] Unexpected error fetching study groups:', err);
        if (isMounted) {
          setFetchError('An unexpected error occurred while loading groups.');
        }
      }
    };

    fetchGroups();

    channel = supabase
      .channel(`study_groups_${uniqueCourseCodes.join(',')}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups',
          filter: `course_code=in.(${uniqueCourseCodes.join(',')})`,
        },
        () => {
          if (isMounted) {
            fetchGroups();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [uniqueCourseCodes, enabled]);

  return { availableGroups, fetchError };
}

// ─── Group Actions Hook ──────────────────────────────────────
function useGroupActions() {
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const joinGroup = useCallback(async ({ groupId, currentMembers, onError }: JoinGroupOptions) => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      const newMembers = [...currentMembers];
      const { error: updateError } = await supabase
        .from('study_groups')
        .update({ members: newMembers })
        .eq('id', groupId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('[Supabase] Error joining group:', err);
      onError(err instanceof Error ? err.message : 'Failed to join group.');
    } finally {
      setIsJoining(false);
    }
  }, [isJoining]);

  const leaveGroup = useCallback(async ({ groupId, currentMembers, onError }: LeaveGroupOptions) => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      const { error: updateError } = await supabase
        .from('study_groups')
        .update({ members: currentMembers })
        .eq('id', groupId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('[Supabase] Error leaving group:', err);
      onError(err instanceof Error ? err.message : 'Failed to leave group.');
    } finally {
      setIsLeaving(false);
    }
  }, [isLeaving]);

  const createGroup = useCallback(async ({ course, userId, onError }: CreateGroupOptions) => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const groupName = `${course.code} Study Group`;
      const { error: insertError } = await supabase
        .from('study_groups')
        .insert({
          course_code: course.code,
          course_name: course.name,
          name: groupName,
          creator_id: userId,
          members: [userId],
        });

      if (insertError) throw insertError;
    } catch (err) {
      console.error('[Supabase] Error creating group:', err);
      onError(err instanceof Error ? err.message : 'Failed to create group.');
    } finally {
      setIsCreating(false);
    }
  }, [isCreating]);

  const isAnyLoading = isJoining || isLeaving || isCreating;

  return { joinGroup, leaveGroup, createGroup, isAnyLoading, isJoining, isLeaving, isCreating };
}

// ─── File Upload Hook ────────────────────────────────────────
function useFileUpload(
  onSuccess: (result: ExtractionResult) => void,
  onError: (message: string | null) => void
) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onError('Please upload an image file.');
      return;
    }

    setIsUploading(true);
    onError(null);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to read file as base64.'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      const result = await extractScheduleFromImage(base64, file.type, supabase);
      onSuccess(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image.';
      onError(message);
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess, onError]);

  return { isUploading, handleFileUpload };
}

// ─── Main App ────────────────────────────────────────────────
export default function App() {
  const { user, isAuthReady, error, setError } = useAuth();
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');

  const courseCodes = useMemo(
    () => extractionResult?.courses.map(c => c.code) ?? [],
    [extractionResult]
  );

  const { availableGroups, fetchError } = useStudyGroups({
    courseCodes,
    enabled: !!extractionResult && courseCodes.length > 0,
  });

  const { joinGroup, leaveGroup, createGroup, isAnyLoading, isJoining, isLeaving, isCreating } = useGroupActions();

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
    } catch {
      setError('Failed to sign in with Google.');
    }
  }, [setError]);

  const handleLogout = useCallback(() => {
    signOut();
  }, []);

  const handleJoinGroup = useCallback((groupId: string, currentMembers: string[]) => {
    if (!user) return;
    joinGroup({
      groupId,
      currentMembers,
      onError: (message) => setError(message),
    });
  }, [user, joinGroup, setError]);

  const handleLeaveGroup = useCallback((groupId: string, currentMembers: string[]) => {
    if (!user) return;
    leaveGroup({
      groupId,
      currentMembers: currentMembers.filter(m => m !== user.uid),
      onError: (message) => setError(message),
    });
  }, [user, leaveGroup, setError]);

  const handleCreateGroup = useCallback((course: Course) => {
    if (!user) return;
    createGroup({
      course,
      userId: user.uid,
      onError: (message) => setError(message),
    });
  }, [user, createGroup, setError]);

  const displayError = useMemo(() => error || fetchError, [error, fetchError]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
                <BookOpen className="text-white w-6 h-6" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">UniSync</span>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={`${user.displayName} profile`}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Sign out">
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin}>Sign In</Button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            {!user ? (
              <LandingPage onLogin={handleLogin} />
            ) : (
              <div className="space-y-8">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-slate-200 pb-px" role="tablist">
                  <button
                    onClick={() => setActiveTab('upload')}
                    role="tab"
                    aria-selected={activeTab === 'upload'}
                    className={cn(
                      'pb-4 px-2 text-sm font-medium transition-all relative',
                      activeTab === 'upload' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    Upload Schedule
                    {activeTab === 'upload' && (
                      <motion.div
                        layoutId="tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('results')}
                    disabled={!extractionResult}
                    role="tab"
                    aria-selected={activeTab === 'results'}
                    className={cn(
                      'pb-4 px-2 text-sm font-medium transition-all relative disabled:opacity-30',
                      activeTab === 'results' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                    )}
                  >
                    Matching Groups
                    {activeTab === 'results' && (
                      <motion.div
                        layoutId="tab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                      />
                    )}
                  </button>
                </div>

                {activeTab === 'upload' ? (
                  <UploadTab
                    isUploading={isUploading}
                    error={error}
                    onFileUpload={handleFileUpload}
                  />
                ) : (
                  <ResultsTab
                    extractionResult={extractionResult}
                    availableGroups={availableGroups}
                    userId={user.uid}
                    error={displayError}
                    isJoining={isJoining}
                    isLeaving={isLeaving}
                    isCreating={isCreating}
                    onJoinGroup={handleJoinGroup}
                    onLeaveGroup={handleLeaveGroup}
                    onCreateGroup={handleCreateGroup}
                    onReupload={() => setActiveTab('upload')}
                  />
                )}
              </div>
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

// ─── Sub-Components ──────────────────────────────────────────

interface LandingPageProps {
  onLogin: () => void;
}

function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <motion.section
      key="landing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center py-20"
    >
      <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
        Find Your Perfect Study Group <br /> with AI Precision
      </h1>
      <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
        Upload a photo of your university schedule, and our AI will instantly match you with existing study groups or help you start a new one for your courses.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" onClick={onLogin}>Get Started Now</Button>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        {[
          { icon: Upload, title: 'Snap & Upload', desc: 'Take a photo of your schedule or course registration.' },
          { icon: Search, title: 'AI Extraction', desc: 'Our AI extracts course codes, names, and timings automatically.' },
          { icon: Users, title: 'Join Groups', desc: 'Instantly see available groups for your specific courses.' },
        ].map((feature, i) => (
          <Card key={feature.title} className="p-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <feature.icon className="text-indigo-600 w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}

interface UploadTabProps {
  isUploading: boolean;
  error: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UploadTab({ isUploading, error, onFileUpload }: UploadTabProps) {
  return (
    <motion.div
      key="upload-tab"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <Card className="p-12 border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-300 transition-colors cursor-pointer relative">
        <input
          type="file"
          accept="image/*"
          onChange={onFileUpload}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
          aria-label="Upload schedule image"
        />
        <div className={cn(
          'w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all',
          isUploading ? 'bg-indigo-100' : 'bg-white shadow-sm group-hover:scale-110'
        )}>
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" aria-label="Processing" />
          ) : (
            <Upload className="w-10 h-10 text-indigo-600" aria-hidden="true" />
          )}
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isUploading ? 'Processing your schedule...' : 'Upload your schedule image'}
        </h2>
        <p className="text-slate-500 max-w-md">
          {isUploading
            ? 'Our AI is analyzing the image to extract course details. This usually takes a few seconds.'
            : 'Drag and drop your image here, or click to browse. We support JPG, PNG and WebP.'}
        </p>
      </Card>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-indigo-50 p-6 rounded-2xl flex gap-4 items-start">
        <Info className="text-indigo-600 w-6 h-6 shrink-0 mt-1" aria-hidden="true" />
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">How it works</h4>
          <p className="text-sm text-indigo-800/80 leading-relaxed">
            Our system uses advanced AI to read the text in your image. It looks for course codes like{' '}
            <code className="bg-indigo-100 px-1 rounded">CS101</code> or{' '}
            <code className="bg-indigo-100 px-1 rounded">ENGL200</code>. Once identified, we search
            our database for active study groups for those exact courses.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface ResultsTabProps {
  extractionResult: ExtractionResult | null;
  availableGroups: Record<string, StudyGroup[]>;
  userId: string;
  error: string | null;
  isJoining: boolean;
  isLeaving: boolean;
  isCreating: boolean;
  onJoinGroup: (groupId: string, members: string[]) => void;
  onLeaveGroup: (groupId: string, members: string[]) => void;
  onCreateGroup: (course: Course) => void;
  onReupload: () => void;
}

function ResultsTab({
  extractionResult,
  availableGroups,
  userId,
  error,
  isJoining,
  isLeaving,
  isCreating,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup,
  onReupload,
}: ResultsTabProps) {
  if (!extractionResult) return null;

  const isActionLoading = isJoining || isLeaving || isCreating;

  return (
    <motion.div
      key="results-tab"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Extracted Courses</h2>
          <p className="text-slate-500">Major: {extractionResult.major}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReupload}>
          Re-upload
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-700" role="alert">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6">
        {extractionResult.courses.map((course) => {
          const groups = availableGroups[course.code] || [];
          const courseKey = course.code;

          return (
            <Card key={courseKey} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase">
                      {course.code}
                    </span>
                    {course.section && (
                      <span className="text-xs text-slate-400">Section {course.section}</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{course.name}</h3>
                  {course.instructor && (
                    <p className="text-sm text-slate-500">Instructor: {course.instructor}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {groups.length > 0 ? (
                    <div className="space-y-3 w-full md:w-auto">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Available Groups</p>
                      {groups.map(group => {
                        const isMember = group.members.includes(userId);
                        return (
                          <div key={group.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <Users className="w-4 h-4 text-slate-400" aria-hidden="true" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{group.name}</p>
                                <p className="text-xs text-slate-500">{group.members.length} members</p>
                              </div>
                            </div>
                            {isMember ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => onLeaveGroup(group.id, group.members)}
                                disabled={isActionLoading}
                                aria-label={`Leave ${group.name}`}
                              >
                                <UserMinus className="w-4 h-4 mr-2" aria-hidden="true" /> Leave
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onJoinGroup(group.id, group.members)}
                                disabled={isActionLoading}
                                aria-label={`Join ${group.name}`}
                              >
                                <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" /> Join
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-right space-y-3">
                      <div className="flex items-center gap-2 text-slate-400 justify-end">
                        <AlertCircle className="w-4 h-4" aria-hidden="true" />
                        <span className="text-sm">No groups found for this course</span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onCreateGroup(course)}
                        disabled={isActionLoading}
                        aria-label={`Create study group for ${course.code}`}
                      >
                        <Plus className="w-4 h-4 mr-2" aria-hidden="true" /> Create Group
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
