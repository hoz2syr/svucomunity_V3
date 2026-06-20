"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { TestModel, Question } from '../types';
import { saveTest } from '../lib/store';
import { upsertTestToSupabase } from '../services/exam.supabase';
import { hasSupabaseEnv, missingSupabaseEnvMessage } from '@/src/lib/supabase';
import { useAuth } from '@/src/contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export interface CreateTestState {
  jsonText: string;
  testTitle: string;
  testDesc: string;
  error: string;
  showExplanations: boolean;
  globalTimeLimit: number;
}

export interface UseTestCreatorReturn extends CreateTestState {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setJsonText: (v: string) => void;
  setTestTitle: (v: string) => void;
  setTestDesc: (v: string) => void;
  setError: (v: string) => void;
  setShowExplanations: (v: boolean) => void;
  setGlobalTimeLimit: (v: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreate: (navigate: (path: string) => void) => void;
}

export function useTestCreator(): UseTestCreatorReturn {
  const { session } = useAuth();
  const [jsonText, setJsonText] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [error, setError] = useState('');
  const [showExplanations, setShowExplanations] = useState(true);
  const [globalTimeLimit, setGlobalTimeLimit] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userIdRef = useRef<string | null>(session?.user?.id ?? null);

  useEffect(() => {
    userIdRef.current = session?.user?.id ?? null;
  }, [session]);

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

  const handleCreate = useCallback((navigate: (path: string) => void) => {
    setError('');
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
        },
        questions,
      };

      saveTest(newTest);

      const uid = userIdRef.current;
      if (uid && hasSupabaseEnv()) {
        upsertTestToSupabase({ ...newTest, userId: uid }).catch((err) => {
          const message = err instanceof Error ? err.message : String(err);
          setError(`فشل مزامنة الامتحان مع السحابة: ${message}`);
        });
      }

      navigate('/exam/saved');
    } catch {
      setError('صيغة JSON غير صالحة. تأكد من صحة الملف.');
    }
  }, [jsonText, testTitle, testDesc, showExplanations, globalTimeLimit]);

  return {
    jsonText, setJsonText,
    testTitle, setTestTitle,
    testDesc, setTestDesc,
    error, setError,
    showExplanations, setShowExplanations,
    globalTimeLimit, setGlobalTimeLimit,
    fileInputRef,
    handleFileUpload,
    handleCreate,
  };
}
