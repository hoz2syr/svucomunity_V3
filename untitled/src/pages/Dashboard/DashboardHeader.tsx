import { AnimatePresence, motion } from 'motion/react';
import { Bell, ChevronDown, LogOut, Shield, Trash2, User } from 'lucide-react';
import type { Notification } from '../../types/notification';

type DashboardUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
};

type NotificationMenuProps = {
  isOpen: boolean;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
  onClose: () => void;
};

export const NotificationMenu = ({ isOpen, unreadCount, loading, error, notifications, onClose }: NotificationMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 transform origin-top-left"
        role="menu"
      >
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <span className="font-bold text-white">الإشعارات</span>
          <span className="text-xs text-slate-400 font-medium">{unreadCount} غير مقروء</span>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">جاري تحميل الإشعارات...</div>
          ) : error ? (
            <div className="px-4 py-6 text-center text-sm text-rose-400">تعذر تحميل الإشعارات</div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">لا توجد إشعارات</div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={onClose}
                className="w-full text-right px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      notification.read ? 'bg-slate-600' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                      {notification.title}
                    </p>
                    {notification.body ? (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.body}</p>
                    ) : null}
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString('ar-SA')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
          >
            عرض كل الإشعارات
          </button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

type ProfileMenuProps = {
  isOpen: boolean;
  user: DashboardUser;
  onClose: () => void;
  onOpenSettings: (tab: 'profile' | 'security') => void;
  onOpenLogout: () => void;
  onOpenDelete: () => void;
};

export const ProfileMenu = ({ isOpen, user, onClose, onOpenSettings, onOpenLogout, onOpenDelete }: ProfileMenuProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute left-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl py-2 z-50 transform origin-top-left"
        role="menu"
      >
        <div className="px-4 py-3 border-b border-white/5">
          <div className="font-bold text-white truncate">{user.name}</div>
          <div className="text-xs text-slate-400 truncate mt-0.5">@{user.username}</div>
        </div>

        <div className="py-2">
          <button onClick={() => { onClose(); onOpenSettings('profile'); }} className="w-full text-right px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors">
            <User size={16} className="text-slate-400" /> إعدادات الحساب
          </button>
          <button onClick={() => { onClose(); onOpenSettings('security'); }} className="w-full text-right px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors">
            <Shield size={16} className="text-slate-400" /> الأمان وكلمة المرور
          </button>
        </div>

        <div className="py-2 border-t border-white/5">
          <button onClick={() => { onClose(); onOpenLogout(); }} className="w-full text-right px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors">
            <LogOut size={16} className="text-slate-400" /> تسجيل الخروج
          </button>
          <button onClick={() => { onClose(); onOpenDelete(); }} className="w-full text-right px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors mt-1">
            <Trash2 size={16} className="text-red-400/80" /> حذف الحساب نهائياً
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
}: DashboardHeaderProps) => (
  <header className="h-20 bg-[#060a1f]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
    <div className="flex items-center gap-4">
      <a href="/dashboard" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-transform group-hover:scale-105 duration-300">
          <span className="text-white font-extrabold text-lg font-display">SVU</span>
        </div>
        <span className="text-white font-bold text-xl tracking-wide hidden lg:block font-display">Community</span>
      </a>
    </div>

    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          id="notifications-menu-button"
          type="button"
          aria-label="الإشعارات"
          aria-haspopup="menu"
          aria-expanded={isNotificationsOpen}
          onClick={onToggleNotifications}
          className="relative p-2.5 rounded-full text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)]"></span>
          )}
        </button>
        <NotificationMenu
          isOpen={isNotificationsOpen}
          unreadCount={unreadCount}
          loading={notificationsLoading}
          error={notificationsError}
          notifications={notifications}
          onClose={onToggleNotifications}
        />
      </div>

      <div className="relative">
        <button
          id="profile-menu-button"
          type="button"
          aria-label={`ملف ${user.name}`}
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
          onClick={onToggleProfile}
          className="flex items-center gap-2 p-1 pl-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white text-sm uppercase">
            {user.name.charAt(0)}
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
        <ProfileMenu
          isOpen={isProfileMenuOpen}
          user={user}
          onClose={onToggleProfile}
          onOpenSettings={onOpenSettings}
          onOpenLogout={onOpenLogout}
          onOpenDelete={onOpenDelete}
        />
      </div>
    </div>
  </header>
);
