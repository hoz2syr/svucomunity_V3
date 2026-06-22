"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchTestsFromSupabase, upsertTestToSupabase } from '../services/exam.supabase';
import { localStorageTestStorage } from '../core/adapters/localStorageTestStorage';
import { hasSupabaseEnv } from '@/src/lib/supabase';

export function useTestMigration({
  userId,
  envMissing,
}: {
  userId: string | null;
  envMissing: boolean;
}) {
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!prev && userId && hasSupabaseEnv() && !envMissing) {
      const localTests = localStorageTestStorage.getTests();
      if (localTests.length === 0) return;

      fetchTestsFromSupabase(userId)
        .then(({ data: serverTests, error }) => {
          if (error) {
            console.error('Migration prefetch failed:', error);
            queryClient.invalidateQueries({ queryKey: ['tests', userId] });
            return;
          }
          const serverIds = new Set((serverTests ?? []).map(t => t.id));
          const unsaved = localTests.filter(t => !serverIds.has(t.id));

          Promise.all(
            unsaved.map(t => upsertTestToSupabase({ ...t, userId })),
          ).finally(() => {
            queryClient.invalidateQueries({ queryKey: ['tests', userId] });
          });
        })
        .catch((err) => {
          console.error('Migration prefetch exception:', err);
          queryClient.invalidateQueries({ queryKey: ['tests', userId] });
        });
    }
  }, [userId, queryClient, envMissing]);
}
