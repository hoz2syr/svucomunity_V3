"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { useCorePlayTest } from '../hooks';
import { PlayTestShell } from '../../components/PlayTestShell';
import { saveTestAttempt } from '../services/exam.supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export default function PlayTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const state = useCorePlayTest(id, navigate, {
    onComplete: async (result) => {
      const userId = session?.user?.id ?? null;
      const answers = Object.fromEntries(
        Object.entries(result.answers).map(([k, v]) => [k, Array.isArray(v) ? JSON.stringify(v) : v])
      );
      await saveTestAttempt({ ...result, userId, answers: answers as Record<string, string> });
    },
  });

  return <PlayTestShell state={state} backPath="/exam/saved" />;
}
