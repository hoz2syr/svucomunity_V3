import React from 'react';
import { motion } from 'motion/react';
import { User, Shield } from 'lucide-react';
import { ModalOverlay } from './ModalOverlay';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { SecuritySettingsForm } from './SecuritySettingsForm';
import { updatePassword, updateProfile } from '../../services/profile.service';
import type { ProfileInput, SecurityInput, SettingsTab } from '../../types/auth';

type SettingsUser = {
  id: string;
  name: string;
  username: string;
  email: string;
};

type SettingsModalProps = {
  user: SettingsUser;
  tab: SettingsTab;
  setTab: (tab: SettingsTab) => void;
  onClose: () => void;
};

export const SettingsModal = ({ user, tab, setTab, onClose }: SettingsModalProps) => {
  const profileInitial: ProfileInput = {
    full_name: user.name,
    username: user.username,
    email: user.email,
  };

  const handleProfileSubmit = async (data: ProfileInput): Promise<string | null> => {
    const result = await updateProfile(user.id, data.full_name, data.username);
    return result.error?.message ?? null;
  };

  const handleSecuritySubmit = async (data: SecurityInput): Promise<string | null> => {
    const result = await updatePassword(user.email, data.current_password, data.new_password);
    return result.error?.message ?? null;
  };

  return (
    <ModalOverlay onClose={onClose} titleId="settings-modal-title" descriptionId="settings-modal-description">
      <h2 id="settings-modal-title" className="sr-only">إعدادات الحساب</h2>
      <p id="settings-modal-description" className="sr-only">إعدادات الملف الشخصي والأمان</p>
      <div className="flex border-b border-white/10">
        <button type="button" onClick={() => setTab('profile')} className={`flex-1 py-4 text-sm font-bold transition-colors flex justify-center items-center gap-2 relative ${tab === 'profile' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <User size={18} /> الملف الشخصي
          {tab === 'profile' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />}
        </button>
        <button type="button" onClick={() => setTab('security')} className={`flex-1 py-4 text-sm font-bold transition-colors flex justify-center items-center gap-2 relative ${tab === 'security' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
          <Shield size={18} /> الأمان
          {tab === 'security' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400" />}
        </button>
      </div>

      <div className="p-8">
        {tab === 'profile' ? (
          <ProfileSettingsForm userId={user.id} initial={profileInitial} onSubmit={handleProfileSubmit} />
        ) : (
          <SecuritySettingsForm onSubmit={handleSecuritySubmit} />
        )}
      </div>
    </ModalOverlay>
  );
};
