import { cn } from '@/lib/utils';
import { useAuth } from '@svu-community/ui';

interface AppTabsProps {
  activeTab: 'upload' | 'results';
  onTabChange: (tab: 'upload' | 'results') => void;
  hasResult: boolean;
}

export function AppTabs({ activeTab, onTabChange, hasResult }: AppTabsProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="flex gap-4 border-b border-slate-200 pb-px" role="tablist">
        <button
          onClick={() => onTabChange('upload')}
          role="tab"
          aria-selected={activeTab === 'upload'}
          className={cn(
            'pb-4 px-2 text-sm font-medium transition-all relative',
            activeTab === 'upload' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Upload Schedule
          {activeTab === 'upload' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
        <button
          onClick={() => onTabChange('results')}
          disabled={!hasResult}
          role="tab"
          aria-selected={activeTab === 'results'}
          className={cn(
            'pb-4 px-2 text-sm font-medium transition-all relative disabled:opacity-30',
            activeTab === 'results' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          Matching Groups
          {activeTab === 'results' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
          )}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'upload' ? 'upload' : 'results'}
      </div>
    </div>
  );
}
