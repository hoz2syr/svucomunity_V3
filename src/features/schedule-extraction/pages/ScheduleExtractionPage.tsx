'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { DropZone } from '../components/DropZone';
import { CourseCard } from '../components/CourseCard';
import { DraftGroupCard } from '../components/DraftGroupCard';
import { EditDraftModal } from '../components/EditDraftModal';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { GroupDetailsModal } from '../components/GroupDetailsModal';
import { useScheduleMatching } from '../hooks';
import { useCourseMatching } from '../hooks/useCourseMatching';
import { createGroup, joinGroup, getGroupMembers } from '@/src/features/study-groups/services/studyGroup.supabase';
import { saveRawExtraction, saveExtractedCourses } from '../services/extractionService.supabase';
import { getCurrentSemesterCode } from '../utils/semesterUtils';
import type { ExtractedCourse, MatchedGroup, DraftGroup } from '../types';
import type { TableSchema } from '../utils/schemaDetection';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error('حجم الملف يتجاوز الحد المسموح (10MB)'));
      return;
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      reject(new Error('نوع الملف غير مدعوم'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [meta, base64] = result.split(',');
      const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/png';
      if (!mimeType.startsWith('image/')) {
        reject(new Error('فشل تحويل الملف إلى صورة صالحة'));
        return;
      }
      resolve({ base64, mimeType });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function ScheduleExtractionPage() {
  const { session, profile } = useAuth();
  const {
    result,
    matchedGroups,
    autoDrafts,
    validation,
    isExtracting,
    error,
    extract,
    reloadGroups,
  } = useScheduleMatching();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const selectedFileRef = useRef<File | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDetails, setGroupDetails] = useState<MatchedGroup | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftGroup | null>(null);
  const [creatingFromCourse, setCreatingFromCourse] = useState<ExtractedCourse | null>(null);
  const [extractionId, setExtractionId] = useState<string | null>(null);
  const [isSavingExtraction, setIsSavingExtraction] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    matchedCourses,
    studyGroupSuggestions,
    isMatching,
    refetch: _refetchMatching,
  } = useCourseMatching(extractionId);

  const handleFileSelect = useCallback((file: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      const url = URL.createObjectURL(file);
      return url;
    });
    selectedFileRef.current = file;
  }, []);

  const handleClear = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setProcessError(null);
  }, []);

  useEffect(() => {
    return () => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const handleExtract = useCallback(async () => {
    const file = selectedFileRef.current || fileInputRef.current?.files?.[0];
    if (!file) {
      setProcessError('الرجاء اختيار صورة الجدول أولاً');
      return;
    }

    setProcessError(null);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      await extract(base64, mimeType);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل معالجة الصورة';
      setProcessError(message);
    }
  }, [extract]);

  const handleSaveExtraction = useCallback(async () => {
    if (!session?.user || !result) return;
    setIsSavingExtraction(true);
    setSaveError(null);
    try {
      const rawMarkdown = JSON.stringify(result);
      const schema: TableSchema = { columns: 0, hasSeparator: false, columnOrder: [] };
      const rawResult = await saveRawExtraction(session.user.id, rawMarkdown, schema);
      if (rawResult.error) {
        setSaveError(rawResult.error.message);
        return;
      }
      const newExtractionId = rawResult.data?.id;
      if (!newExtractionId) {
        setSaveError('فشل حفظ الاستخراج');
        return;
      }
      const currentSemester = profile?.current_semester || getCurrentSemesterCode();
      const coursesWithSemester = result.courses.map((course) => ({
        ...course,
        semester: course.semester || currentSemester,
      }));
      const coursesResult = await saveExtractedCourses(newExtractionId, coursesWithSemester);
      if (coursesResult.error) {
        setSaveError(coursesResult.error.message);
        return;
      }
      setExtractionId(newExtractionId);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'فشل حفظ الاستخراج');
    } finally {
      setIsSavingExtraction(false);
    }
  }, [session, result, profile]);

  const handleOpenGroupDetails = useCallback(async (groupId: string) => {
    setSelectedGroupId(groupId);
    // Find group from matchedGroups or autoDrafts
    let found: MatchedGroup | undefined;
    for (const groups of Object.values(matchedGroups)) {
      found = groups.find((g) => g.id === groupId);
      if (found) break;
    }
    if (!found) {
      const draft = autoDrafts.find((d) => d.id === groupId);
      if (draft) {
        found = {
          id: draft.id,
          name: draft.name,
          course_code: draft.course_code,
          course_name: draft.course_name,
          major: draft.major,
          class_number: draft.class_number ?? null,
          current_members: 0,
          max_members: draft.max_members,
          is_full: false,
          creator_name: '',
          whatsapp_link: draft.whatsapp_link ?? null,
        };
      }
    }
    setGroupDetails(found ?? null);

    // Load members
    const membersRes = await getGroupMembers(groupId);
    if (membersRes.data) {
      setMemberIds(membersRes.data.map((m) => m.user_id));
    } else {
      setMemberIds([]);
    }
  }, [matchedGroups, autoDrafts]);

  const handleOpenCreateGroup = useCallback((course: ExtractedCourse) => {
    setCreatingFromCourse(course);
  }, []);

  const handleEditDraft = useCallback((draft: DraftGroup) => {
    setEditingDraft(draft);
  }, []);

  const handleSaveDraft = useCallback(
    async (data: {
      name: string;
      course_name: string;
      course_code: string;
      major: string;
      class_number: string | null;
      instructor: string | null;
      max_members: number;
      whatsapp_link: string;
    }) => {
      if (!session?.user) return;
      setIsSavingDraft(true);
      setActionError(null);
      try {
        await createGroup({
          name: data.name,
          course_name: data.course_name,
          course_code: data.course_code,
          class_number: data.class_number ?? '',
          doctor_name: data.instructor ?? '',
          major: data.major,
          max_members: data.max_members,
          whatsapp_link: data.whatsapp_link,
          creator_id: session.user.id,
          creator_name: profile?.full_name || session.user.email || 'مستخدم',
        });
        setEditingDraft(null);
        await reloadGroups();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'فشل إنشاء المجموعة';
        setActionError(message);
      } finally {
        setIsSavingDraft(false);
      }
    },
    [session, profile, reloadGroups]
  );

  const handleCreateGroup = useCallback(
    async (data: {
      name: string;
      course_name: string;
      course_code: string;
      class_number: string | null;
      doctor_name: string | null;
      major: string;
      max_members: number;
      whatsapp_link: string;
    }) => {
      if (!session?.user) return;
      setIsSavingDraft(true);
      setActionError(null);
      try {
        await createGroup({
          name: data.name,
          course_name: data.course_name,
          course_code: data.course_code,
          class_number: data.class_number ?? '',
          doctor_name: data.doctor_name ?? '',
          major: data.major,
          max_members: data.max_members,
          whatsapp_link: data.whatsapp_link,
          creator_id: session.user.id,
          creator_name: profile?.full_name || session.user.email || 'مستخدم',
        });
        setCreatingFromCourse(null);
        await reloadGroups();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'فشل إنشاء المجموعة';
        setActionError(message);
      } finally {
        setIsSavingDraft(false);
      }
    },
    [session, profile, reloadGroups]
  );

  const handleJoinGroup = useCallback(async () => {
    if (!selectedGroupId || !session?.user) return;
    setIsJoining(true);
    setActionError(null);
    try {
      await joinGroup(selectedGroupId, session.user.id);
      setSelectedGroupId(null);
      setGroupDetails(null);
      await reloadGroups();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل الانضمام للمجموعة';
      setActionError(message);
    } finally {
      setIsJoining(false);
    }
  }, [selectedGroupId, session, reloadGroups]);

  const handleCloseEditingDraft = useCallback(() => {
    setEditingDraft(null);
  }, []);

  const handleCloseCreating = useCallback(() => {
    setCreatingFromCourse(null);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2 pt-4">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          📅 استخراج الجدول
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          ارفع صورة جدولك الدراسي وسيقوم الذكاء الاصطناعي باستخراج المواد
          والمجموعات المطابقة
        </p>
      </div>

      <DropZone
        previewUrl={previewUrl ?? null}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
        isExtracting={isExtracting}
        onExtract={handleExtract}
        inputRef={fileInputRef}
      />

      {isExtracting && (
        <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-indigo-300 text-sm">جاري تحليل الصورة واستخراج الجدول...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
          <p className="text-rose-400 text-sm font-medium">{error}</p>
          <p className="text-slate-400 text-xs">
            تأكد من أن الصورة واضحة وتحتوي على جدول دراسي، ثم حاول مرة أخرى.
          </p>
          <button
            onClick={handleExtract}
            className="text-xs text-rose-300 hover:text-rose-200 underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {processError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
          <p className="text-rose-400 text-sm font-medium">{processError}</p>
          <p className="text-slate-400 text-xs">
            يمكنك رفع صورة جديدة أو تعديل الإعدادات والمحاولة مرة أخرى.
          </p>
          <button
            onClick={handleExtract}
            className="text-xs text-rose-300 hover:text-rose-200 underline"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-2">
          <p className="text-rose-400 text-sm font-medium">{actionError}</p>
          <p className="text-slate-400 text-xs">
            إذا استمرت المشكلة، حاول مرة أخرى أو تواصل مع الدعم الفني.
          </p>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-300 hover:text-rose-200 underline"
          >
            إغلاق
          </button>
        </div>
      )}

      {validation && (validation.warnings.length > 0 || validation.errors.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((err, i) => (
            <div key={`err-${i}`} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-rose-400 text-sm">{err}</p>
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={`warn-${i}`} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 text-sm">{warn}</p>
            </div>
          ))}
        </div>
      )}

      {result && result.courses.length > 0 && (
        <div className="space-y-6">
          {result.major && (
            <div className="inline-flex items-center px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-medium border border-indigo-500/20">
              التخصص: {result.major}
            </div>
          )}

          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-white">المواد المستخرجة</h2>
            <span className="text-sm text-slate-500">
              ({result.courses.length})
            </span>
          </div>

          <div className="grid gap-5">
            {result.courses.map((course) => (
              <CourseCard
                key={course.code}
                course={course}
                matchedGroups={matchedGroups[course.code.toUpperCase()] || []}
                onOpenGroupDetails={handleOpenGroupDetails}
                onOpenCreateGroup={handleOpenCreateGroup}
              />
            ))}
          </div>

          {!extractionId && (
            <button
              onClick={handleSaveExtraction}
              disabled={isSavingExtraction}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {isSavingExtraction ? 'جاري الحفظ...' : 'حفظ وتحليل المواد'}
            </button>
          )}

          {saveError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-rose-400 text-sm">{saveError}</p>
            </div>
          )}
        </div>
      )}

      {autoDrafts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-white">المجموعات المسودة</h2>
            <span className="text-sm text-slate-500">({autoDrafts.length})</span>
          </div>
          <p className="text-sm text-slate-400">
            اضغط على البطاقة لتعديل البيانات ثم إنشاء المجموعة
          </p>
          <div className="grid gap-5">
            {autoDrafts.map((draft) => (
              <DraftGroupCard
                key={draft.id}
                draft={draft}
                onEdit={handleEditDraft}
              />
            ))}
          </div>
        </div>
      )}

      {extractionId && isMatching && (
        <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-indigo-300 text-sm">جاري تحليل المواد واقتراح المجموعات...</p>
        </div>
      )}

      {extractionId && matchedCourses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-white">حالة المواد</h2>
            <span className="text-sm text-slate-500">
              ({matchedCourses.length})
            </span>
          </div>
          <div className="grid gap-4">
            {matchedCourses.map((course) => (
              <div
                key={course.code}
                className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl"
              >
                <div>
                  <p className="text-white font-medium text-sm">{course.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{course.code}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.status === 'new'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : course.status === 'passed'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      : course.status === 'carried'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {course.status === 'new'
                    ? 'جديد'
                    : course.status === 'passed'
                    ? 'ناجح'
                    : course.status === 'carried'
                    ? 'نقل'
                    : 'راسب'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {extractionId && studyGroupSuggestions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold text-white">المجموعات المقترحة</h2>
            <span className="text-sm text-slate-500">
              ({studyGroupSuggestions.length})
            </span>
          </div>
          <p className="text-sm text-slate-400">
            مجموعات دراسية مقترحة بناءً على موادك
          </p>
          <div className="grid gap-4">
            {studyGroupSuggestions.map((suggestion) => (
              <div
                key={suggestion.group.id}
                className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {suggestion.group.course_name}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {suggestion.group.course_code} • {suggestion.group.major}
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400 font-medium whitespace-nowrap">
                    {suggestion.relevanceScore}% تطابق
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestion.reasons.slice(0, 3).map((reason, idx) => (
                    <span
                      key={`${suggestion.group.id}-reason-${idx}`}
                      className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full text-xs"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {suggestion.group.current_members}/{suggestion.group.max_members} عضو
                  </span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-500">
                    {suggestion.group.creator_name}
                  </span>
                </div>
                <button
                  onClick={() => handleOpenGroupDetails(suggestion.group.id)}
                  className="w-full py-2 px-4 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium transition-colors"
                >
                  عرض المجموعة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && !error && !previewUrl && !isExtracting && (
        <div className="text-center py-16 text-slate-500 text-sm">
          ارفع صورة للبدء
        </div>
      )}

      {isExtracting && !result && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-indigo-300 text-sm font-medium">جاري تحليل الصورة...</p>
          <p className="text-slate-500 text-xs">قد يستغرق هذا بضع ثوانٍ</p>
        </div>
      )}

      <GroupDetailsModal
        isOpen={!!selectedGroupId && !!groupDetails}
        group={groupDetails}
        memberIds={memberIds}
        currentUserId={session?.user?.id}
        onJoin={handleJoinGroup}
        onClose={() => {
          setSelectedGroupId(null);
          setGroupDetails(null);
        }}
        isJoining={isJoining}
      />

      <EditDraftModal
        isOpen={!!editingDraft}
        draft={editingDraft}
        currentUserMajor={profile?.major ?? undefined}
        onClose={handleCloseEditingDraft}
        onSave={handleSaveDraft}
        isSaving={isSavingDraft}
      />

      <CreateGroupModal
        isOpen={!!creatingFromCourse}
        courseCode={creatingFromCourse?.code ?? null}
        courseName={creatingFromCourse?.name ?? null}
        currentUserMajor={profile?.major ?? undefined}
        onClose={handleCloseCreating}
        onCreate={handleCreateGroup}
        isCreating={isSavingDraft}
      />
    </div>
  );
}
