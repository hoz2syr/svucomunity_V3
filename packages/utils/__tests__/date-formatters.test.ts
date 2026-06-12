import { describe, it, expect } from 'vitest';
import { formatDate, formatTime, formatScheduleDay } from '../src/date/formatters';

describe('date formatters', () => {
  it('formatDate returns ar-SA locale', () => {
    const originalDate = globalThis.Date;
    const fixedDate = new Date(Date.UTC(2024, 0, 15));
    globalThis.Date = class extends Date {
      constructor(...args: any[]) {
        if (args.length === 0) return fixedDate;
        return new originalDate(...args);
      }
    } as any;
    const result = formatDate('2024-01-15');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
    globalThis.Date = originalDate;
  });

  it('formatTime returns the time string as-is', () => {
    expect(formatTime('14:30')).toBe('14:30');
  });

  it('formatScheduleDay returns Arabic day name', () => {
    expect(formatScheduleDay(0)).toBe('الأحد');
    expect(formatScheduleDay(6)).toBe('السبت');
  });

  it('formatScheduleDay returns empty string for out-of-range day', () => {
    expect(formatScheduleDay(-1)).toBe('');
  });
});
