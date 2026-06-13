import { BookOpen, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { User, Profile } from '@svu-community/types';

type DisplayUser = (User | Profile) & {
  display_name?: string | null;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};

interface AppHeaderProps {
  user: DisplayUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

function isSafeAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function AppHeader({ user, onLogin, onLogout }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <BookOpen className="text-white w-6 h-6" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">UniSync</span>
        </div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user.display_name ?? (`${user.first_name} ${user.last_name}`.trim() || user.username)}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
             {isSafeAvatarUrl(user.avatar_url) && (
              <img
                src={user.avatar_url ?? ''}
                alt={`${user.display_name ?? user.username ?? ''} profile`}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                referrerPolicy="no-referrer"
                rel="noopener noreferrer"
              />
            )}
            <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Sign out">
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <Button onClick={onLogin}>Sign In</Button>
        )}
      </div>
    </header>
  );
}
