"use client";

import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Dropdown } from '@/src/components/ui/Dropdown';

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
  searchInput: string;
  onMajorChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onSearchInputChange: (value: string) => void;
  onSearchTrigger: () => void;
  onClearFilters: () => void;
  showSearch?: boolean;
}

export function PublishedTestsFilters({
  majors,
  courses,
  selectedMajor,
  selectedCourse,
  searchQuery,
  searchInput,
  onMajorChange,
  onCourseChange,
  onSearchInputChange,
  onSearchTrigger,
  onClearFilters,
  showSearch = true,
}: PublishedTestsFiltersProps) {
  const majorOptions = useMemo<SelectOption[]>(() => majors.map(m => ({ label: m, value: m })), [majors]);
  const courseOptions = useMemo<SelectOption[]>(() => courses.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code })), [courses]);

  const hasActiveFilters = showSearch ? searchQuery || selectedMajor || selectedCourse : selectedMajor || selectedCourse;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3">
      {showSearch && (
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSearchTrigger();
              }
            }}
            placeholder="ابحث باسم الاختبار أو الوصف..."
            className="input-field w-full pr-10 pl-20 py-2.5 rounded-xl text-white text-sm placeholder:text-slate-500"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  onSearchInputChange('');
                  onSearchTrigger();
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onSearchTrigger}
              className="text-primary-400 hover:text-primary-300 transition"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
