import type { SubjectTab } from '../src/types';

type SubjectTabsProps = {
  activeTab: SubjectTab;
  onTabChange: (tab: SubjectTab) => void;
};

const tabs: { key: SubjectTab; label: string }[] = [
  { key: 'info', label: 'معلومات المادة' },
  { key: 'references', label: 'المصادر' },
  { key: 'my-contributions', label: 'مشاركاتي' },
  { key: 'tests', label: 'الاختبارات' },
  { key: 'groups', label: 'المجموعات' },
];

export function SubjectTabs({ activeTab, onTabChange }: SubjectTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/8 overflow-x-auto" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`
            flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
            whitespace-nowrap
            ${activeTab === tab.key
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
