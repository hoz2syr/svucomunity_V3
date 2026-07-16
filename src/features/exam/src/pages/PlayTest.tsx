"use client";

import { useParams, useNavigate } from 'react-router-dom';
import { useCorePlayTest } from '../hooks';
import { PlayTestShell } from '../../components/PlayTestShell';
import { saveTestAttempt } from '../services/attempts.service';
import { useAuth } from '@/src/contexts/AuthContext';
import { useToast } from '@/src/components/ui/Toast';

export default function PlayTest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();

  const state = useCorePlayTest(id, navigate, {
    onComplete: async (result) => {
      const userId = session?.user?.id ?? null;
      const answers = Object.fromEntries(
        Object.entries(result.answers).map(([k, v]) => [k, Array.isArray(v) ? JSON.stringify(v) : v])
      );
      try {
        const saveResult = await saveTestAttempt({ ...result, userId, answers: answers as Record<string, string> });
        if (saveResult.error) {
          toast(saveResult.error.message, 'error');
        }
      } catch {
        toast('فشل حفظ النتيجة، يرجى المحاولة مرة أخرى', 'error');
      }
    },
  });

  return <PlayTestShell state={state} backPath="/exam/saved" />;
}
