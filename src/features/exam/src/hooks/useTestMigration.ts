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
  const isCancelledRef = useRef(false);

  useEffect(() => {
    isCancelledRef.current = false;
    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (!prev && userId && hasSupabaseEnv() && !envMissing) {
      const localTests = localStorageTestStorage.getTests();
      if (localTests.length === 0) return;

      fetchTestsFromSupabase(userId)
        .then(({ data: serverTests, error }) => {
          if (isCancelledRef.current) return;
          if (import.meta.env.DEV) {
            console.debug('[MIG] fetchTestsFromSupabase resolved', { userId, serverCount: (serverTests ?? []).length, error });
          }
          if (error) {
            if (import.meta.env.DEV) {
              console.error('Migration prefetch failed:', error);
            }
            queryClient.invalidateQueries({ queryKey: ['tests', userId] });
            return;
          }
          const serverList = (serverTests ?? []) as TestModel[];
          const serverIds = new Set(serverList.map(t => t.id));
          const unsaved = localTests.filter(t => !serverIds.has(t.id));
          if (import.meta.env.DEV) {
            console.debug('[MIG] before upsert', { localCount: localTests.length, serverCount: serverList.length, unsavedCount: unsaved.length, unsavedIds: unsaved.map(t => t.id) });
          }

          Promise.allSettled(
            unsaved.map(t => upsertTestToSupabase({ ...t, userId })),
          ).then((results) => {
            if (isCancelledRef.current) return;
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
              if (import.meta.env.DEV) {
                console.error(`[MIG] ${failed.length} tests failed to migrate`);
              }
              queryClient.invalidateQueries({ queryKey: ['tests', userId] });
              return;
            }
            if (import.meta.env.DEV) {
              console.debug('[MIG] upsert all resolved');
            }
            localStorageTestStorage.clearUserData(userId);
            const updatedServerList = [...serverList, ...unsaved];
            supabaseStorage.hydrateFromServer(userId, updatedServerList);
            queryClient.setQueryData(['tests', userId], (old: { pages: TestModel[][]; pageParams: unknown[] } | undefined) => {
              const newUnique = unsaved.filter((t) => !old?.pages.some((p: TestModel[]) => p.some((pt) => pt.id === t.id)));
              if (import.meta.env.DEV) {
                console.debug('[MIG] setQueryData', { oldPagesLen: old?.pages.length ?? 0, newUniqueCount: newUnique.length, updatedLen: updatedServerList.length });
              }
              if (!old || old.pages.length === 0) return { pages: [[...updatedServerList]], pageParams: [undefined] };
              const newPages = old.pages.map((page: TestModel[]) => [
                ...page,
                ...newUnique.filter((t) => !page.some((p) => p.id === t.id)),
              ]);
              return { ...old, pages: newPages };
            });
          });
        })
        .catch((err) => {
          if (isCancelledRef.current) return;
          if (import.meta.env.DEV) {
            console.error('Migration prefetch exception:', err);
          }
          queryClient.invalidateQueries({ queryKey: ['tests', userId] });
        });
    }

    return () => {
      isCancelledRef.current = true;
    };
  }, [userId, queryClient, envMissing]);
}
