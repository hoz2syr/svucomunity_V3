"use client";

import { useState, useMemo, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Dropdown } from '../../study-groups/components/Dropdown';
import { useDebounce } from '@/src/features/study-groups/src/hooks/useDebounce';

interface SelectOption {
  label: string;
  value: string;
}

interface PublishedTestsFiltersProps {
  majors: string[];
  courses: { code: string; name: string }[];
  selectedMajor: string;
  selectedCourse: string;
  searchQuery: string;
  onMajorChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export function PublishedTestsFilters({
  majors,
  courses,
  selectedMajor,
  selectedCourse,
  searchQuery,
  onMajorChange,
  onCourseChange,
  onSearchChange,
  onClearFilters,
}: PublishedTestsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const { debouncedFn: debouncedSearch, cancel: cancelSearch } = useDebounce((value: string) => {
    onSearchChange(value);
  }, 300);

  useEffect(() => {
    return () => {
      cancelSearch();
    };
  }, [cancelSearch]);

  const majorOptions = useMemo<SelectOption[]>(() => majors.map(m => ({ label: m, value: m })), [majors]);
  const courseOptions = useMemo<SelectOption[]>(() => courses.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code })), [courses]);

  const hasActiveFilters = searchQuery || selectedMajor || selectedCourse;

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    debouncedSearch(value);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="ابحث باسم الاختبار أو الوصف..."
          className="input-field w-full pr-10 pl-4 py-2.5 rounded-xl text-white text-sm placeholder:text-slate-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch('');
              onSearchChange('');
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Dropdown
          searchable
          value={selectedMajor}
          onChange={(v) => { onMajorChange(v); onCourseChange(''); }}
          options={majorOptions}
          placeholder="كل التخصصات"
          searchPlaceholder="ابحث بتخصص..."
          className="min-w-[140px]"
        />

        <Dropdown
          searchable
          value={selectedCourse}
          onChange={onCourseChange}
          options={courseOptions}
          placeholder="كل المواد"
          searchPlaceholder="ابحث بمادة أو كود..."
          className="min-w-[140px]"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 text-slate-400 hover:text-white text-sm transition flex items-center gap-1.5 hover:bg-white/5 rounded-xl"
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </button>
        )}
      </div>
    </div>
  );
}
