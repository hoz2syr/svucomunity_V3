"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { useCorePlayTest } from '../hooks';
import { PlayTestShell } from '../../components/PlayTestShell';
import { saveTestAttempt } from '../services/exam.supabase';
import { useAuth } from '@/src/contexts/AuthContext';

export default function PlayTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, envMissing } = useAuth();

  const state = useCorePlayTest(id, navigate, {
    onComplete: async (result) => {
      const userId = session?.user?.id ?? null;
      await saveTestAttempt({ ...result, userId });
    },
  });

  return <PlayTestShell state={state} backPath="/exam/saved" />;
}
