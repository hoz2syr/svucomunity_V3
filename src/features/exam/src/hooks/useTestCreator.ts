"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { TestModel, Question } from '../types';
import { saveTest } from '../lib/store';
import { upsertTestToSupabase } from '../services/tests.service';
import { hasSupabaseEnv, missingSupabaseEnvMessage, getCurrentSession } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { getAllMajorsStatic, getCoursesByMajorStatic } from '@/src/features/study-groups/services/courseCatalog';
import type { Course } from '@/src/features/study-groups/services/studyGroup.supabase';

export interface CreateTestState {
  jsonText: string;
  testTitle: string;
  testDesc: string;
  error: string;
  showExplanations: boolean;
  globalTimeLimit: number;
  selectedMajor: string;
  selectedCourse: string;
}

export interface UseTestCreatorReturn extends CreateTestState {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setJsonText: (v: string) => void;
  setTestTitle: (v: string) => void;
  setTestDesc: (v: string) => void;
  setError: (v: string) => void;
  setShowExplanations: (v: boolean) => void;
  setGlobalTimeLimit: (v: number) => void;
  setSelectedMajor: (v: string) => void;
  setSelectedCourse: (v: string) => void;
  majors: string[];
  courses: Course[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreate: (navigate?: (path: string) => void) => void;
  handlePublish: (testId: string, navigate: (path: string, options?: { replace?: boolean }) => void) => Promise<void>;
  publishingId: string | null;
  publishError: string | null;
}

export function useTestCreator(): UseTestCreatorReturn {
  const { session } = useAuth();
  const { profile } = useAuth();
  const [jsonText, setJsonText] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [error, setError] = useState('');
  const [showExplanations, setShowExplanations] = useState(true);
  const [globalTimeLimit, setGlobalTimeLimit] = useState(0);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [majors, setMajors] = useState<string[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const userIdRef = useRef<string | null>(session?.user?.id ?? null);
  const profileMajorAppliedRef = useRef(false);

  useEffect(() => {
    userIdRef.current = session?.user?.id ?? null;
  }, [session]);

  useEffect(() => {
    let cancelled = false;
    getAllMajorsStatic().then((list: string[]) => {
      if (!cancelled) setMajors(list);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (profile?.major && !selectedMajor && !profileMajorAppliedRef.current) {
      profileMajorAppliedRef.current = true;
      setSelectedMajor(profile.major);
    }
  }, [profile?.major, selectedMajor]);

  useEffect(() => {
    if (!selectedMajor) {
      setCourses([]);
      return;
    }
    let cancelled = false;
    getCoursesByMajorStatic(selectedMajor).then((list: Course[]) => {
      if (!cancelled) setCourses(list);
    });
    return () => { cancelled = true; };
  }, [selectedMajor]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setJsonText(content);
      } catch {
        setError('تعذر قراءة الملف.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleCreate = useCallback((navigate?: (path: string) => void) => {
    setError('');
    setPublishError(null);
    if (!testTitle.trim()) {
      setError('يرجى إدخال عنوان الاختبار');
      return;
    }

    try {
      let cleanJsonText = jsonText.trim();
      cleanJsonText = cleanJsonText.replace(/^```(json)?\s*/i, '');
      cleanJsonText = cleanJsonText.replace(/\s*```$/i, '');

      const parsedData = JSON.parse(cleanJsonText);
      let questions: Question[] = [];

      if (Array.isArray(parsedData)) {
        questions = parsedData;
      } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
        questions = parsedData.questions;
      } else {
        setError('لم يتم العثور على مصفوفة أسئلة (questions) في ملف الـ JSON');
        return;
      }

      questions = questions.map(q => ({ ...q, id: q.id || uuidv4() }));

      const newTest: TestModel = {
        id: uuidv4(),
        title: testTitle,
        description: testDesc,
        createdAt: Date.now(),
        settings: {
          showExplanations,
          globalTimeLimitMinutes: globalTimeLimit || undefined,
          major: selectedMajor || undefined,
          courseCode: selectedCourse || undefined,
        },
        questions,
        published: false,
      };

      saveTest(newTest);
      navigate?.('/exam/saved');
    } catch {
      setError('صيغة JSON غير صالحة. تأكد من صحة الملف.');
    }
  }, [jsonText, testTitle, testDesc, showExplanations, globalTimeLimit, selectedMajor, selectedCourse]);

  const handlePublish = useCallback(async (testId: string, navigate?: (path: string, options?: { replace?: boolean }) => void) => {
    setPublishError(null);
    setPublishingId(testId);

    let uid = userIdRef.current;

    if (!uid) {
      const freshSession = await getCurrentSession();
      uid = freshSession?.user?.id ?? null;
      if (freshSession?.user?.id) {
        userIdRef.current = freshSession.user.id;
      }
    }

    if (!uid) {
      setPublishingId(null);
      navigate?.('/login', { replace: true });
      return;
    }

    if (!hasSupabaseEnv()) {
      setPublishingId(null);
      setPublishError(missingSupabaseEnvMessage);
      return;
    }

    try {
      const tests = (() => {
        try {
          const data = localStorage.getItem('svu_tests_db');
          return data ? JSON.parse(data) : [];
        } catch {
          return [];
        }
      })();

      const testIndex = tests.findIndex((t: TestModel) => t.id === testId);
      if (testIndex === -1) {
        setPublishError('الاختبار غير موجود');
        setPublishingId(null);
        return;
      }

      const test = tests[testIndex];
      const updatedTest: TestModel = {
        ...test,
        published: true,
      };

      const result = await upsertTestToSupabase({ ...updatedTest, userId: uid });

      if (result.error) {
        setPublishError(result.error.message || 'فشل نشر الاختبار');
        setPublishingId(null);
        return;
      }

      tests[testIndex] = updatedTest;
      localStorage.setItem('svu_tests_db', JSON.stringify(tests));
      setPublishingId(null);
      navigate?.('/exam/saved');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setPublishError(message);
      setPublishingId(null);
    }
  }, []);

  return {
    jsonText, setJsonText,
    testTitle, setTestTitle,
    testDesc, setTestDesc,
    error, setError,
    showExplanations, setShowExplanations,
    globalTimeLimit, setGlobalTimeLimit,
    selectedMajor, setSelectedMajor,
    selectedCourse, setSelectedCourse,
    majors, courses,
    fileInputRef,
    handleFileUpload,
    handleCreate,
    handlePublish,
    publishingId,
    publishError,
  };
}
