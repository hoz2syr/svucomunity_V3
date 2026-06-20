import React from 'react';
import { LogOut } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';

export const LogoutModal = ({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) => (
  <ModalOverlay onClose={onClose} titleId="logout-modal-title" descriptionId="logout-modal-description">
    <div className="p-8">
      <div className="w-14 h-14 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5">
        <LogOut size={26} strokeWidth={2.5} />
      </div>
      <h3 id="logout-modal-title" className="text-xl font-bold text-white mb-2">تسجيل الخروج</h3>
      <p id="logout-modal-description" className="text-slate-400 text-sm mb-8 leading-relaxed">
        هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟ يمكنك العودة لتسجيل الدخول في أي وقت.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors">إلغاء</button>
        <button type="button" onClick={onConfirm} className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-colors">تأكيد الخروج</button>
      </div>
    </div>
  </ModalOverlay>
);
