import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, ChevronDown, LogOut, Shield, Trash2, User, X } from 'lucide-react';
import type { Notification } from '../../types/notification';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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
          {unreadCount > 0 && <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">{unreadCount} غير مقروء</span>}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">جاري تحميل الإشعارات…</div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-rose-400 bg-rose-500/5 m-2 rounded-xl">{error}</div>
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
                      notification.read ? 'bg-slate-600' : 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]'
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
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors hover:underline underline-offset-4"
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
  onClose: () => void;
  onOpenSettings: (tab: 'profile' | 'security') => void;
  onOpenLogout: () => void;
  onOpenDelete: () => void;
  reducedMotion?: boolean;
};

export const ProfileMenu = ({ isProfileMenuOpen, user, onClose, onOpenSettings, onOpenLogout, onOpenDelete, reducedMotion = false }: ProfileMenuProps) => (
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
          <button onClick={() => { onClose(); onOpenDelete(); }} className="w-full text-right px-4 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-3 transition-all mt-1 rounded-lg mx-2">
            <Trash2 size={17} className="text-rose-400/80" /> حذف الحساب نهائياً
          </button>
        </div>
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
  onToggleNotifications: () => void;
  onToggleProfile: () => void;
  onOpenSettings: (tab: 'profile' | 'security') => void;
  onOpenLogout: () => void;
  onOpenDelete: () => void;
};

export const DashboardHeader = ({
  user,
  isNotificationsOpen,
  unreadCount,
  notificationsLoading,
  notificationsError,
  notifications,
  isProfileMenuOpen,
  onToggleNotifications,
  onToggleProfile,
  onOpenSettings,
  onOpenLogout,
  onOpenDelete,
}: DashboardHeaderProps) => {
  const reducedMotion = useReducedMotion();
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => setExpanded(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!searchFocused) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchFocused]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        onToggleNotifications();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen, onToggleNotifications]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        onToggleProfile();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, onToggleProfile]);

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
      animate={reducedMotion ? { height: expanded ? 80 : 56, borderRadius: 32, marginTop: expanded ? 12 : 24, marginLeft: expanded ? 16 : 24, marginRight: expanded ? 16 : 24 } : {
        height: expanded ? 80 : 56,
        borderRadius: 32,
        marginTop: expanded ? 12 : 24,
        marginLeft: expanded ? 16 : 24,
        marginRight: expanded ? 16 : 24,
      }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-30 bg-[var(--color-bg-tertiary)]/75 backdrop-blur-2xl border border-cyan-500/10 shadow-lg shadow-cyan-900/10 flex items-center justify-between px-5 lg:px-8"
    >
      <div className="flex items-center gap-3">
        <a href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.35)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.5)]">
            <span className="text-white font-extrabold text-[15px] font-display tracking-tight">SVU</span>
          </div>
          <motion.span
            animate={reducedMotion ? { opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 } : { opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
            className="text-white font-extrabold text-xl tracking-wide hidden lg:block font-display overflow-hidden whitespace-nowrap"
          >
            Community
          </motion.span>
        </a>
      </div>

      <div className="flex items-center gap-2">
        <div ref={searchRef} className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'w-64' : 'w-10'} hidden md:flex`}>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث..."
            aria-label="بحث في المحتوى"
            onFocus={() => setSearchFocused(true)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pr-3 pl-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/40 focus:bg-white/8 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="مسح البحث"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
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
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-extrabold rounded-full shadow-[0_0_12px_rgba(244,63,94,0.7)] px-1">
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

        <div className="relative" ref={profileRef}>
          <button
            id="profile-menu-button"
            type="button"
            aria-label={`ملف ${user.name}`}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
            onClick={onToggleProfile}
            className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-full hover:bg-white/8 border border-transparent hover:border-cyan-500/20 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_16px_rgba(99,102,241,0.35)]">
              {user.name.charAt(0)}
            </div>
            <motion.span
              animate={reducedMotion ? { opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 } : { opacity: expanded ? 1 : 0, width: expanded ? 'auto' : 0 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
              className="text-sm font-semibold text-slate-200 hidden lg:block max-w-[8rem] truncate overflow-hidden whitespace-nowrap"
            >
              {user.name}
            </motion.span>
            <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180 text-cyan-400' : ''}`} />
          </button>
          <ProfileMenu
            isProfileMenuOpen={isProfileMenuOpen}
            user={user}
            onClose={onToggleProfile}
            onOpenSettings={onOpenSettings}
            onOpenLogout={onOpenLogout}
            onOpenDelete={onOpenDelete}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </motion.header>
  );
};
