import { useEffect, useRef, useState, useCallback } from 'react';
import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, ChevronDown, LogIn, LogOut, Shield, Trash2, User, X, Search } from 'lucide-react';
import type { Notification } from '../../types/notification';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useClickOutside } from '../../hooks/useClickOutside';

type DashboardUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
};

type NotificationMenuProps = {
  isNotificationsOpen: boolean;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  onClose: () => void;
  reducedMotion?: boolean;
};

export const NotificationMenu = ({ isNotificationsOpen, unreadCount, loading, error, notifications, onClose, reducedMotion = false }: NotificationMenuProps) => (
  <AnimatePresence>
    {isNotificationsOpen && (
      <motion.div
        initial={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
        className="absolute left-0 mt-3 w-80 bg-[var(--color-bg-primary)]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-900/20 py-2.5 z-50"
        role="menu"
      >
        <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
          <span className="font-extrabold text-white tracking-wide">الإشعارات</span>
          {unreadCount > 0 && <span className="text-xs text-cyan-400 font-bold bg-[var(--color-info-light)] border border-[var(--color-info-border)] px-2.5 py-1 rounded-full">{unreadCount} غير مقروء</span>}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">جاري تحميل الإشعارات…</div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-danger-400)] bg-[var(--color-danger-light)] m-2 rounded-xl">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell size={26} className="text-slate-600 mx-auto mb-2" />
              <span className="text-sm text-slate-400">لا توجد إشعارات</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={onClose}
                className="w-full text-right px-4 py-3.5 hover:bg-white/5 transition-all border-b border-white/5 last:border-b-0 group/item"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${
                       notification.read ? 'bg-slate-600' : 'bg-cyan-400 shadow-[var(--shadow-glow-indigo-70)]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors ${notification.read ? 'text-slate-500' : 'text-white group-hover/item:text-cyan-300'}`}>
                      {notification.title}
                    </p>
                    {notification.body ? (
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{notification.body}</p>
                    ) : null}
                    <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                      {new Date(notification.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-white/5 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[var(--color-info-400)] hover:text-[var(--color-info-300)] font-bold transition-colors hover:underline underline-offset-4"
          >
            عرض كل الإشعارات
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

type ProfileMenuProps = {
  isProfileMenuOpen: boolean;
  user: DashboardUser;
  isGuest: boolean;
  onClose: () => void;
  onOpenSettings: (tab: 'profile' | 'security') => void;
  onOpenLogout: () => void;
  onOpenDelete: () => void;
  onOpenLogin: () => void;
  reducedMotion?: boolean;
};

export const ProfileMenu = ({ isProfileMenuOpen, user, isGuest, onClose, onOpenSettings, onOpenLogout, onOpenDelete, onOpenLogin, reducedMotion = false }: ProfileMenuProps) => (
  <AnimatePresence>
    {isProfileMenuOpen && (
      <motion.div
        initial={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.95 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
        className="absolute left-0 mt-3 w-64 bg-[var(--color-bg-primary)]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-900/20 py-2.5 z-50"
        role="menu"
      >
        {isGuest ? (
          <div className="py-2">
            <button onClick={() => { onClose(); onOpenLogin(); }} className="w-full text-right px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-white/5 hover:text-cyan-200 flex items-center gap-3 transition-all">
              <LogIn size={17} className="text-cyan-400" /> تسجيل الدخول
            </button>
            <p className="px-4 pt-2 text-xs text-slate-500">سجّل دخولك لحفظ بياناتك والوصول لجميع الميزات</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-3.5 border-b border-white/5">
              <div className="font-extrabold text-white truncate text-[15px]">{user.name}</div>
              <div className="text-xs text-slate-400 truncate mt-1 font-medium">@{user.username}</div>
            </div>
            <div className="py-2">
              <button onClick={() => { onClose(); onOpenSettings('profile'); }} className="w-full text-right px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-all">
                <User size={17} className="text-slate-400" /> إعدادات الحساب
              </button>
              <button onClick={() => { onClose(); onOpenSettings('security'); }} className="w-full text-right px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-all">
                <Shield size={17} className="text-slate-400" /> الأمان وكلمة المرور
              </button>
            </div>
            <div className="py-2 border-t border-white/5">
              <button onClick={() => { onClose(); onOpenLogout(); }} className="w-full text-right px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-all">
                <LogOut size={17} className="text-slate-400" /> تسجيل الخروج
              </button>
              <button onClick={() => { onClose(); onOpenDelete(); }} className="w-full text-right px-4 py-3 text-sm font-semibold text-[var(--color-danger-400)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger-300)] flex items-center gap-3 transition-all mt-1 rounded-lg mx-2">
                <Trash2 size={17} className="text-rose-400/80" /> حذف الحساب نهائياً
              </button>
            </div>
          </>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

type DashboardHeaderProps = {
  user: DashboardUser;
  isNotificationsOpen: boolean;
  unreadCount: number;
  notificationsLoading: boolean;
  notificationsError: string | null;
  notifications: Notification[];
  isProfileMenuOpen: boolean;
  isGuest: boolean;
  onToggleNotifications: () => void;
  onToggleProfile: () => void;
  onOpenSettings: (tab: 'profile' | 'security') => void;
  onOpenLogout: () => void;
  onOpenDelete: () => void;
  onOpenLogin: () => void;
};

export const DashboardHeader = React.memo(function DashboardHeader({
  user,
  isNotificationsOpen,
  unreadCount,
  notificationsLoading,
  notificationsError,
  notifications,
  isProfileMenuOpen,
  isGuest,
  onToggleNotifications,
  onToggleProfile,
  onOpenSettings,
  onOpenLogout,
  onOpenDelete,
  onOpenLogin,
}: DashboardHeaderProps) {
  const reducedMotion = useReducedMotion();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNotificationsClickOutside = useCallback((event: Event) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
      onToggleNotifications();
    }
  }, [onToggleNotifications]);

  const handleProfileClickOutside = useCallback((event: Event) => {
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      onToggleProfile();
    }
  }, [onToggleProfile]);

  useClickOutside(notificationsRef, handleNotificationsClickOutside, { enabled: isNotificationsOpen });
  useClickOutside(profileRef, handleProfileClickOutside, { enabled: isProfileMenuOpen });

  useEffect(() => {
    if (!isNotificationsOpen && !isProfileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isNotificationsOpen) onToggleNotifications();
        if (isProfileMenuOpen) onToggleProfile();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationsOpen, isProfileMenuOpen, onToggleNotifications, onToggleProfile]);

  return (
    <motion.header
      initial={reducedMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-30 h-16 bg-[var(--color-bg-tertiary)]/80 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8"
    >
      {/* Brand */}
      <a href="/dashboard" className="flex items-center gap-3 group shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[var(--shadow-glow-cyan-35)] transition-all group-hover:scale-105 group-hover:shadow-[var(--shadow-glow-cyan-50)]">
          <span className="text-white font-extrabold text-[13px] font-display tracking-tight">SVU</span>
        </div>
        <span className="font-extrabold text-white text-base tracking-wide font-display hidden sm:inline">
          Community
        </span>
      </a>

      {/* Search */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المحتوى..."
            aria-label="بحث في المحتوى"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-9 pl-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/40 focus:bg-white/[0.07] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            id="notifications-menu-button"
            type="button"
            aria-label="الإشعارات"
            aria-haspopup="menu"
            aria-expanded={isNotificationsOpen}
            onClick={onToggleNotifications}
            className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-[var(--color-danger)] text-white text-[10px] font-extrabold rounded-full shadow-[var(--shadow-glow-rose-70)] px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationMenu
            isNotificationsOpen={isNotificationsOpen}
            unreadCount={unreadCount}
            loading={notificationsLoading}
            error={notificationsError}
            notifications={notifications}
            onClose={onToggleNotifications}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            id="profile-menu-button"
            type="button"
            aria-label={`ملف ${user.name}`}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={onToggleProfile}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-full hover:bg-white/8 border border-transparent hover:border-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xs shadow-[var(--shadow-glow-indigo-35)]">
              {user.name.charAt(0)}
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-all duration-200 ${isProfileMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>
          <ProfileMenu
            isProfileMenuOpen={isProfileMenuOpen}
            user={user}
            isGuest={isGuest}
            onClose={onToggleProfile}
            onOpenSettings={onOpenSettings}
            onOpenLogout={onOpenLogout}
            onOpenDelete={onOpenDelete}
            onOpenLogin={onOpenLogin}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </motion.header>
  );
});
