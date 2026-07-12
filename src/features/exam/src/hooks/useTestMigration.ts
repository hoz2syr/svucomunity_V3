"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchTestsFromSupabase, upsertTestToSupabase } from '../services/tests.service';
import { localStorageTestStorage } from '../core/storage/localStorageTestStorage';
import { supabaseStorage } from '../core/adapters/supabaseTestStorage';
import type { TestModel } from '../types';
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
          console.debug('[MIG] fetchTestsFromSupabase resolved', { userId, serverCount: (serverTests ?? []).length, error });
          if (error) {
            console.error('Migration prefetch failed:', error);
            queryClient.invalidateQueries({ queryKey: ['tests', userId] });
            return;
          }
          const serverList = (serverTests ?? []) as TestModel[];
          const serverIds = new Set(serverList.map(t => t.id));
          const unsaved = localTests.filter(t => !serverIds.has(t.id));
          console.debug('[MIG] before upsert', { localCount: localTests.length, serverCount: serverList.length, unsavedCount: unsaved.length, unsavedIds: unsaved.map(t => t.id) });

          Promise.all(
            unsaved.map(t => upsertTestToSupabase({ ...t, userId })),
          ).then(() => {
            console.debug('[MIG] upsert all resolved');
            localStorageTestStorage.clearUserData(userId);
            const updatedServerList = [...serverList, ...unsaved];
            supabaseStorage.hydrateFromServer(userId, updatedServerList);
            queryClient.setQueryData(['tests', userId], (old: { pages: TestModel[][]; pageParams: unknown[] } | undefined) => {
              const newUnique = unsaved.filter((t) => !old?.pages.some((p: TestModel[]) => p.some((pt) => pt.id === t.id)));
              console.debug('[MIG] setQueryData', { oldPagesLen: old?.pages.length ?? 0, newUniqueCount: newUnique.length, updatedLen: updatedServerList.length });
              if (!old || old.pages.length === 0) return { pages: [[...updatedServerList]], pageParams: [undefined] };
              const newPages = old.pages.map((page: TestModel[]) => [
                ...page,
                ...newUnique.filter((t) => !page.some((p) => p.id === t.id)),
              ]);
              return { ...old, pages: newPages };
            });
          }).catch((err) => {
            console.error('Migration upsert failed:', err);
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
