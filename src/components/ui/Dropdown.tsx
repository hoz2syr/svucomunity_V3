"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  error?: string;
  className?: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  searchPlaceholder = 'ابحث...',
  error,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filteredOptions = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`
          input-field w-full px-4 py-3 rounded-xl text-white text-sm text-right
          flex items-center justify-between
          ${error ? 'border-rose-500/50' : ''}
        `}
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-slate-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--color-bg-elevated)] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {searchable && (
            <div className="p-2">
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pr-7 pl-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none placeholder:text-slate-500"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className={`${searchable ? 'max-h-60 overflow-auto border-t border-white/5' : 'max-h-60 overflow-y-auto py-1'}`}>
            {filteredOptions.length === 0 ? (
              <div className={`${searchable ? 'px-3 py-2.5' : 'px-4 py-3'} text-slate-500 text-sm`}>
                {searchable ? 'لا توجد نتائج' : 'لا توجد خيارات'}
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`
                    w-full text-right text-sm transition-colors
                    ${searchable ? 'px-3 py-2' : 'px-4 py-2.5'}
                    ${value === opt.value
                      ? (searchable ? 'text-[var(--color-info-400)] bg-white/5' : 'bg-[var(--color-info-light)] text-[var(--color-info-400)]')
                      : 'text-slate-300 hover:bg-white/5'
                    }
                  `}
                >
                  {opt.sublabel ? (
                    <>
                      <div className="font-medium">{opt.label}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{opt.sublabel}</div>
                    </>
                  ) : (
                    <div className={!searchable ? 'font-mono' : ''}>{opt.label}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
