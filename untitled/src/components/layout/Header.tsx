import React from 'react';
import { AuthButton } from '../ui/AuthButton';

type User = {
  name: string;
};

export interface HeaderProps {
  user?: User;
  onLogin?: () => void;
  onLogout?: () => void;
  onCreateAccount?: () => void;
}

export const Header = ({ user, onLogin, onLogout, onCreateAccount }: HeaderProps) => (
  <header className="storybook-header border-b border-white/10 bg-slate-950/80 p-4 text-white">
    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 font-display font-extrabold text-white shadow-lg shadow-cyan-500/20">
          SVU
        </div>
        <div>
          <h1 className="text-lg font-extrabold">SVU Community</h1>
          <p className="text-xs text-slate-400">Storybook preview boundary</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <span className="hidden text-sm text-slate-300 sm:inline">مرحباً، {user.name}</span>
            <AuthButton defaultText="تسجيل الخروج" onClick={onLogout} className="w-auto py-2 px-4 text-sm" />
          </>
        ) : (
          <>
            <AuthButton defaultText="تسجيل الدخول" onClick={onLogin} className="w-auto py-2 px-4 text-sm" />
            <AuthButton defaultText="إنشاء حساب" onClick={onCreateAccount} className="w-auto py-2 px-4 text-sm" />
          </>
        )}
      </div>
    </div>
  </header>
);
