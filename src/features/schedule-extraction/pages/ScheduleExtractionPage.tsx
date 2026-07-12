'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { DropZone } from '../components/DropZone';
import { CourseCard } from '../components/CourseCard';
import { DraftGroupCard } from '../components/DraftGroupCard';
import { EditDraftModal } from '../components/EditDraftModal';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { GroupDetailsModal } from '../components/GroupDetailsModal';
import { useScheduleMatching } from '../hooks';
import { createGroup, joinGroup, getGroupMembers } from '@/src/features/study-groups/services/studyGroup.supabase';
import type { ExtractedCourse, MatchedGroup, DraftGroup } from '../types';

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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupDetails, setGroupDetails] = useState<MatchedGroup | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [editingDraft, setEditingDraft] = useState<DraftGroup | null>(null);
  const [creatingFromCourse, setCreatingFromCourse] = useState<ExtractedCourse | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleClear = useCallback(() => {
    setPreviewUrl(null);
  }, []);

  const handleExtract = useCallback(async () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    try {
      const { base64, mimeType } = await fileToBase64(file);
      await extract(base64, mimeType);
    } catch (err) {
      console.error('Failed to process image:', err);
    }
  }, [extract]);

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
        console.error('Failed to create group:', err);
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
        console.error('Failed to create group:', err);
      } finally {
        setIsSavingDraft(false);
      }
    },
    [session, profile, reloadGroups]
  );

  const handleJoinGroup = useCallback(async () => {
    if (!selectedGroupId || !session?.user) return;
    setIsJoining(true);
    try {
      await joinGroup(selectedGroupId, session.user.id);
      setSelectedGroupId(null);
      setGroupDetails(null);
      await reloadGroups();
    } catch (err) {
      console.error('Failed to join group:', err);
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
      />

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
          <p className="text-rose-400 text-sm">{error}</p>
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

      {!result && !error && !previewUrl && (
        <div className="text-center py-16 text-slate-500 text-sm">
          ارفع صورة للبدء
        </div>
      )}

      <GroupDetailsModal
        isOpen={!!selectedGroupId && !!groupDetails}
        group={groupDetails}
        memberIds={memberIds}
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
