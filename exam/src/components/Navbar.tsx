import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Plus, FolderHeart, LayoutDashboard } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();
  
  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: BookOpen },
    { name: 'إنشاء اختبار', path: '/create', icon: Plus },
    { name: 'اختباراتي', path: '/saved', icon: FolderHeart },
    { name: 'الإحصائيات', path: '/dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-40 glass border-b border-white/10 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl p-1.5 shadow-lg shadow-primary-500/30">
             <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-white tracking-wide hidden sm:block">مجتمع الاختبارات</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all",
                  isActive 
                    ? "bg-primary-500/20 text-primary-400" 
                    : "text-secondary-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:block">{link.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  );
}
