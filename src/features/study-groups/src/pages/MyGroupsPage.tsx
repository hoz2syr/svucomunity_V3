"use client";

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { studyGroupService } from '../core/services';
import { GroupCard } from '../../components/GroupCard';
import { StudyGroupCardSkeleton } from '../../components/StudyGroupCardSkeleton';
import type { StudyGroup } from '../types';
import { PrimaryButton } from '@/src/components/ui/PrimaryButton';
import { ErrorState } from '../../components/ErrorState';

export default function MyGroupsPage() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [createdGroups, setCreatedGroups] = useState<StudyGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const loadMyGroups = async () => {
      setLoading(true);
      setError(null);
      try {
        const { created, joined } = await studyGroupService.getMyGroups(userId);
        setCreatedGroups(created || []);
        setJoinedGroups(joined || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل تحميل مجموعاتك');
      } finally {
        setLoading(false);
      }
    };

    loadMyGroups();
  }, [userId]);

  if (!userId) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <p className="text-slate-400 text-center">يرجى تسجيل الدخول لعرض مجموعاتك</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <StudyGroupCardSkeleton count={4} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const totalGroups = createdGroups.length + joinedGroups.length;

  if (totalGroups === 0) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
            <Users className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">لا توجد مجموعات</h3>
          <p className="text-slate-400 mb-4 text-sm">أنت لست عضو في أي مجموعة بعد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      {createdGroups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            المجموعات التي أنشأتها ({createdGroups.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {createdGroups.map((group) => (
              <GroupCard key={group.id} group={group} onClick={() => {}} />
            ))}
          </div>
        </div>
      )}

      {joinedGroups.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            المجموعات التي انضممت إها ({joinedGroups.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {joinedGroups.map((group) => (
              <GroupCard key={group.id} group={group} onClick={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}