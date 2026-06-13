import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  events: { date: string; title: string }[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const ARABIC_DAYS = ['سبت', 'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

export function Calendar({ events, currentMonth, onMonthChange }: CalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const jsDayOfWeek = firstDayOfMonth.getDay();
  const startDayOfWeek = (jsDayOfWeek + 1) % 7;

  const prevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const eventDates = useCallback(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.date));
    return set;
  }, [events])();

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasEvent = eventDates.has(dateStr);
    const today = isToday(d);
    days.push(
      <div
        key={d}
        className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium relative cursor-default transition-colors
          ${hasEvent ? 'bg-indigo-600 text-white' : ''}
          ${!hasEvent && today ? 'border-2 border-indigo-600 text-indigo-600' : ''}
          ${!hasEvent && !today ? 'text-slate-700 hover:bg-slate-100' : ''}
        `}
      >
        {d}
        {hasEvent && (
          <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Previous month"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
        <h3 className="text-lg font-bold text-slate-900">
          {ARABIC_MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Next month"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {ARABIC_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-slate-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
}
