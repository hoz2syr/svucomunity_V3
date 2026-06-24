"use client";

import { useState, useMemo, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import type { StudyGroupFilters, Course } from '../src/types';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { useDebounce } from '../src/hooks/useDebounce';

interface SelectOption {
  label: string;
  value: string;
}

interface StudyGroupsFiltersProps {
  filters: StudyGroupFilters;
  majors: string[];
  courses: Course[];
  classes: string[];
  onUpdateFilter: <K extends keyof StudyGroupFilters>(key: K, value: StudyGroupFilters[K]) => void;
  onClearFilters: () => void;
  onSearchChange: (value: string) => void;
}

export function StudyGroupsFilters({
  filters,
  majors,
  courses,
  classes,
  onUpdateFilter,
  onClearFilters,
  onSearchChange,
}: StudyGroupsFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
  const classOptions = useMemo<SelectOption[]>(() => classes.map(c => ({ label: c, value: c })), [classes]);
  const statusOptions = useMemo<SelectOption[]>(() => [
    { label: 'كل الحالات', value: 'all' },
    { label: 'متاحة', value: 'available' },
    { label: 'ممتلئة', value: 'full' },
  ], []);

  const hasActiveFilters = filters.search || filters.major || filters.course_code || filters.class_number || filters.status !== 'all';

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-3">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="ابحث بالاسم أو المادة أو التخصص أو الدكتور..."
          className="input-field w-full pr-10 pl-4 py-2.5 rounded-xl text-white text-sm placeholder:text-slate-500"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
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
          value={filters.major}
          onChange={(v) => onUpdateFilter('major', v)}
          options={majorOptions}
          placeholder="كل التخصصات"
          searchPlaceholder="ابحث بتخصص..."
          className="min-w-[140px]"
        />

        <Dropdown
          searchable
          value={filters.course_code}
          onChange={(v) => onUpdateFilter('course_code', v)}
          options={courseOptions}
          placeholder="كل المواد"
          searchPlaceholder="ابحث بمادة أو كود..."
          className="min-w-[140px]"
        />

        <Dropdown
          searchable
          value={filters.class_number}
          onChange={(v) => onUpdateFilter('class_number', v)}
          options={classOptions}
          placeholder="كل الصفوف"
          searchPlaceholder="ابحث بقسم..."
          className="min-w-[140px]"
        />

        <Dropdown
          searchable
          value={filters.status}
          onChange={(v) => onUpdateFilter('status', v as StudyGroupFilters['status'])}
          options={statusOptions}
          placeholder="كل الحالات"
          searchPlaceholder="ابحث بحالة..."
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
