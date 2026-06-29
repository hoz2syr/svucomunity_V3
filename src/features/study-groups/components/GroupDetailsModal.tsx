"use client";

import { useState } from 'react';
import { BookOpen, Calendar, User, GraduationCap, MessageCircle, Link2, Trash2, AlertTriangle, CheckCircle2, Loader2, LogOut, Edit2 } from 'lucide-react';
import type { StudyGroup } from '../src/types';
import { ProgressBar } from './ProgressBar';
import { ModalShell } from './ModalShell';
import { Button } from '@/src/components/ui/Button';

interface GroupDetailsModalProps {
  group: StudyGroup | null;
  isOpen: boolean;
  onClose: () => void;
  isMember: boolean;
  canDelete: boolean;
  currentUserMajor?: string;
  onJoin: (groupId: string) => Promise<void>;
  onDelete: (groupId: string) => void;
  onLeave: (groupId: string, groupName: string) => Promise<void>;
  onEdit: () => void;
  joiningId: string | null;
  leavingId: string | null;
}

export function GroupDetailsModal({
  group,
  isOpen,
  onClose,
  isMember,
  canDelete,
  currentUserMajor,
  onJoin,
  onDelete,
  onLeave,
  onEdit,
  joiningId,
  leavingId,
}: GroupDetailsModalProps) {
  const [showConfirmJoin, setShowConfirmJoin] = useState(false);
  const [showConfirmLeave, setShowConfirmLeave] = useState(false);
  const [majorMismatch, setMajorMismatch] = useState<{ groupMajor: string; userMajor: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !group) return null;

  const isFull = group.current_members >= group.max_members;
  const userMajor = currentUserMajor || '';

  const handleJoinClick = () => {
    if (group.major && userMajor && group.major !== userMajor) {
      setMajorMismatch({ groupMajor: group.major, userMajor });
      return;
    }
    setShowConfirmJoin(true);
  };

  const handleConfirmJoin = async () => {
    setMajorMismatch(null);
    await onJoin(group.id);
    setShowConfirmJoin(false);
  };

  const handleConfirmDelete = () => {
    onDelete(group.id);
    onClose();
  };

  const handleConfirmLeave = async () => {
    setShowConfirmLeave(false);
    await onLeave(group.id, group.name);
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" closeButton>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{group.name}</h3>
        <span className="inline-block px-2.5 py-1 bg-[var(--color-info-light)] text-[var(--color-info-400)] rounded-lg text-xs font-mono border border-[var(--color-info-border)]">
          {group.course_code}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-slate-300">
          <BookOpen className="w-5 h-5 text-slate-500 shrink-0" />
          <span className="text-sm">{group.course_name}</span>
        </div>

        {group.class_number && (
          <div className="flex items-center gap-3 text-slate-300">
            <Calendar className="w-5 h-5 text-slate-500 shrink-0" />
            <span className="text-sm">السنة {group.class_number}</span>
          </div>
        )}

        {group.doctor_name && (
          <div className="flex items-center gap-3 text-slate-300">
            <User className="w-5 h-5 text-slate-500 shrink-0" />
            <span className="text-sm">د. {group.doctor_name}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-slate-300">
          <GraduationCap className="w-5 h-5 text-slate-500 shrink-0" />
          <span className="text-sm font-mono">{group.major}</span>
        </div>
      </div>

      <ProgressBar current={group.current_members} max={group.max_members} className="mb-6" />

      <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl mb-6 border border-white/[0.06]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {(group._creatorFullName || group.creator_name || 'م')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">
            {group._creatorFullName || group.creator_name}
          </p>
          {group._creatorUsername && (
            <p className="text-slate-500 text-xs truncate">@{group._creatorUsername}</p>
          )}
        </div>
        <span className="text-slate-600 text-xs shrink-0">
          {new Date(group.created_at).toLocaleDateString('ar-SA')}
        </span>
      </div>

      <div className="space-y-3">
        {isMember && group.whatsapp_link && (
          <a
            href={group.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full py-3 rounded-xl font-semibold text-white text-sm
              bg-gradient-to-r from-emerald-600 to-emerald-500
              hover:from-emerald-500 hover:to-emerald-400
              flex items-center justify-center gap-2
              shadow-md
              transition-all duration-200
            "
          >
            <MessageCircle className="w-5 h-5" />
            انضم عبر الواتساب
          </a>
        )}

        {group.group_link && isMember && (
          <a
            href={group.group_link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full py-3 rounded-xl font-semibold text-white text-sm
              bg-slate-700 hover:bg-slate-600
              flex items-center justify-center gap-2
              transition-colors duration-200
            "
          >
            <Link2 className="w-5 h-5" />
            رابط المجموعة
          </a>
        )}

{majorMismatch && (
           <div className="p-4 bg-[var(--color-warning-light)] border border-[var(--color-warning-border)] rounded-xl">
              <p className="text-[var(--color-warning-400)] text-sm font-semibold text-center mb-2">
               <AlertTriangle className="w-5 h-5 inline-block ml-1.5" />
               هذه المجموعة لتخصص {majorMismatch.groupMajor}
             </p>
              <p className="text-[var(--color-warning-300)]/80 text-xs text-center mb-3">
               تخصصك: {majorMismatch.userMajor} - هل تريد المتابعة؟
             </p>
             <div className="flex gap-2">
               <Button onClick={handleConfirmJoin} className="flex-1">
                 متابعة
               </Button>
               <Button variant="secondary" onClick={() => setMajorMismatch(null)} className="flex-1">
                 إلغاء
               </Button>
             </div>
           </div>
         )}

{!isMember && !isFull && !showConfirmJoin && (
           <Button 
             onClick={handleJoinClick}
              className="
                w-full
                bg-gradient-to-r from-amber-500 to-rose-500
                hover:from-amber-400 hover:to-rose-400
                 shadow-md
                 hover:shadow-lg
              "
           >
             <CheckCircle2 className="w-5 h-5" />
             انضم للمجموعة
           </Button>
         )}

         {!isMember && !isFull && showConfirmJoin && (
           <Button 
             onClick={handleConfirmJoin}
             disabled={joiningId === group.id}
             className="w-full"
           >
             {joiningId === group.id ? (
               <Loader2 className="w-5 h-5 animate-spin" />
             ) : (
               <CheckCircle2 className="w-5 h-5" />
             )}
             {joiningId === group.id ? 'جاري الانضمام...' : 'تأكيد الانضمام'}
           </Button>
         )}

        {isMember && (
          <div className="
            w-full py-3 rounded-xl font-semibold text-sm text-center
            bg-[var(--color-success-light)] border border-[var(--color-success-border)] text-[var(--color-success-400)]
            flex items-center justify-center gap-2
          ">
            <CheckCircle2 className="w-5 h-5" />
            أنت عضو في هذه المجموعة
          </div>
        )}

{isMember && !canDelete && !showConfirmLeave && (
           <Button variant="secondary" onClick={() => setShowConfirmLeave(true)} className="w-full">
             <LogOut className="w-5 h-5" />
             مغادرة المجموعة
           </Button>
         )}

         {isMember && !canDelete && showConfirmLeave && (
           <div className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-xl">
             <p className="text-slate-400 text-sm font-semibold text-center mb-3">
               هل أنت متأكد من مغادرة هذه المجموعة؟
             </p>
             <div className="flex gap-2">
               <Button variant="secondary" onClick={handleConfirmLeave} disabled={leavingId === group.id} className="flex-1">
                 {leavingId === group.id ? 'جاري المغادرة...' : 'نعم، مغادرة'}
               </Button>
               <Button variant="secondary" onClick={() => setShowConfirmLeave(false)} className="flex-1">
                 إلغاء
               </Button>
             </div>
           </div>
         )}

        {!isMember && isFull && (
          <div className="
            w-full py-3 rounded-xl font-semibold text-sm text-center
            bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] text-[var(--color-danger-400)]
          ">
            المجموعة ممتلئة
          </div>
        )}

{canDelete && !showDeleteConfirm && (
           <Button onClick={onEdit} className="w-full">
             <Edit2 className="w-5 h-5" />
             تعديل المجموعة
           </Button>
          )}

         {canDelete && !showDeleteConfirm && (
           <Button variant="danger" onClick={() => setShowDeleteConfirm(true)} className="w-full">
             <Trash2 className="w-5 h-5" />
             حذف المجموعة
           </Button>
         )}

         {canDelete && showDeleteConfirm && (
<div className="p-4 bg-[var(--color-danger-light)] border border-[var(--color-danger-border)] rounded-xl">
              <p className="text-[var(--color-danger-400)] text-sm font-semibold text-center mb-3">
               هل أنت متأكد من حذف هذه المجموعة؟
             </p>
             <div className="flex gap-2">
               <Button variant="danger" onClick={handleConfirmDelete} className="flex-1">
                 نعم، احذف
               </Button>
               <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                 إلغاء
               </Button>
             </div>
           </div>
         )}
      </div>
    </ModalShell>
  );
}
