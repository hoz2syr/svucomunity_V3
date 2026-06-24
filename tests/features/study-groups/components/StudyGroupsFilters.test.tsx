import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudyGroupsFilters } from '@/src/features/study-groups/components/StudyGroupsFilters';
import type { StudyGroupFilters, Course } from '@/src/features/study-groups/src/types';

const defaultFilters: StudyGroupFilters = {
  search: '',
  major: '',
  course_code: '',
  class_number: '',
  status: 'all',
};

const mockMajors = ['علوم الحاسب', 'هندسة'];
const mockCourses: Course[] = [
  { code: 'CS101', name: 'مقدمة في علوم الحاسب', major: 'علوم الحاسب' },
  { code: 'ENG101', name: 'مقدمة في الهندسة', major: 'هندسة' },
];
const mockClasses = ['C1', 'C2', 'C3'];

const defaultProps = {
  filters: defaultFilters,
  majors: mockMajors,
  courses: mockCourses,
  classes: mockClasses,
  onUpdateFilter: vi.fn(),
  onClearFilters: vi.fn(),
  onSearchChange: vi.fn(),
};

describe('StudyGroupsFilters component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(<StudyGroupsFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText('ابحث بالاسم أو المادة أو التخصص أو الدكتور...')).toBeDefined();
  });

  it('should render all dropdowns', () => {
    render(<StudyGroupsFilters {...defaultProps} />);
    expect(screen.getByText('كل التخصصات')).toBeDefined();
    expect(screen.getByText('كل المواد')).toBeDefined();
    expect(screen.getByText('كل الصفوف')).toBeDefined();
    expect(screen.getByText('كل الحالات')).toBeDefined();
  });

  it('should call onSearchChange when typing in search input', async () => {
    vi.useFakeTimers();
    const onSearchChange = vi.fn();
    render(<StudyGroupsFilters {...defaultProps} onSearchChange={onSearchChange} />);
    const searchInput = screen.getByPlaceholderText('ابحث بالاسم أو المادة أو التخصص أو الدكتور...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    vi.advanceTimersByTime(400);
    await vi.runAllTimersAsync();
    expect(onSearchChange).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });

  it('should call onClearFilters when clear button clicked', () => {
    const onClearFilters = vi.fn();
    const filtersWithValues: StudyGroupFilters = {
      ...defaultFilters,
      search: 'test',
      major: 'علوم الحاسب',
    };
    render(<StudyGroupsFilters {...defaultProps} filters={filtersWithValues} onClearFilters={onClearFilters} />);
    fireEvent.click(screen.getByText('مسح الفلاتر'));
    expect(onClearFilters).toHaveBeenCalled();
  });

  it('should not show clear button when no filters active', () => {
    render(<StudyGroupsFilters {...defaultProps} />);
    expect(screen.queryByText('مسح الفلاتر')).toBeNull();
  });

  it('should show clear button when filters are active', () => {
    const filtersWithValues: StudyGroupFilters = {
      ...defaultFilters,
      search: 'test',
    };
    render(<StudyGroupsFilters {...defaultProps} filters={filtersWithValues} />);
    expect(screen.getByText('مسح الفلاتر')).toBeDefined();
  });

  it('should render all filter dropdowns', () => {
    render(<StudyGroupsFilters {...defaultProps} />);
    expect(screen.getByText('كل التخصصات')).toBeDefined();
    expect(screen.getByText('كل المواد')).toBeDefined();
    expect(screen.getByText('كل الصفوف')).toBeDefined();
    expect(screen.getByText('كل الحالات')).toBeDefined();
  });

  it('should open dropdown and show options', async () => {
    render(<StudyGroupsFilters {...defaultProps} />);
    const majorButton = screen.getByText('كل التخصصات').closest('button');
    if (majorButton) fireEvent.click(majorButton);
    await waitFor(() => expect(screen.getByText('علوم الحاسب')).toBeDefined());
  });

  it('should show available status options when dropdown opened', async () => {
    render(<StudyGroupsFilters {...defaultProps} />);
    const statusButton = screen.getByText('كل الحالات').closest('button');
    if (statusButton) fireEvent.click(statusButton);
    await waitFor(() => {
      expect(screen.getByText('متاحة')).toBeDefined();
      expect(screen.getByText('ممتلئة')).toBeDefined();
    });
  });

  it('should clear search when X button clicked', () => {
    const onSearchChange = vi.fn();
    const filtersWithSearch: StudyGroupFilters = { ...defaultFilters, search: 'test' };
    render(<StudyGroupsFilters {...defaultProps} filters={filtersWithSearch} onSearchChange={onSearchChange} />);
    const clearButton = screen.getByRole('button', { name: '' });
    if (clearButton) fireEvent.click(clearButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
