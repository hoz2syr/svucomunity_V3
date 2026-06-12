import { MajorSelector } from '../major-selector';

export interface FilterBarProps {
  majors: string[];
  selectedMajor: string;
  onSelectMajor: (major: string) => void;
  loading: boolean;
  courseStats: { total: number; filtered: number };
  onRetry: () => void;
}

export function FilterBar({ majors, selectedMajor, onSelectMajor, loading, courseStats, onRetry }: FilterBarProps) {
  return (
    <div className="px-6 py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {loading ? (
          <div className="h-11 w-[280px] bg-slate-800/50 rounded-xl animate-pulse" />
        ) : (
          <>
            <MajorSelector
              majors={majors}
              selectedMajor={selectedMajor}
              onSelectMajor={onSelectMajor}
            />
            <span className="text-slate-500 text-sm">
              {courseStats.filtered} من {courseStats.total} مادة
            </span>
          </>
        )}

        <button
          onClick={onRetry}
          disabled={loading}
          aria-label="إعادة تحميل المواد"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
          </svg>
          تحديث
        </button>
      </div>
    </div>
  );
}
