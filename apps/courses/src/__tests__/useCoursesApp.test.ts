import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCoursesApp } from '../hooks/useCoursesApp';

let mockRefetch = () => {};

vi.mock('../hooks/useCourses', () => ({
  useCourses: () => ({
    courses: [{ id: '1', code: 'CS101', name: 'Test', name_ar: null, major: 'CS', description: '', is_active: true, created_at: '' }],
    majors: ['CS', 'IT'],
    loading: false,
    error: null,
    refetch: () => mockRefetch(),
  }),
}));


describe('useCoursesApp', () => {
  it('returns app state with defaults', () => {
    const { result } = renderHook(() => useCoursesApp());
    expect(result.current.state.activeTab).toBe('courses');
    expect(result.current.state.selectedMajor).toBe('جميع التخصصات');
    expect(result.current.filteredCourses.length).toBe(1);
    expect(result.current.courseStats).toEqual({ total: 1, filtered: 1 });
  });

  it('filters by major', () => {
    const { result } = renderHook(() => useCoursesApp());
    act(() => result.current.actions.setSelectedMajor('IT'));
    expect(result.current.state.selectedMajor).toBe('IT');
    expect(result.current.filteredCourses.length).toBe(0);
  });

  it('switches active tab', () => {
    const { result } = renderHook(() => useCoursesApp());
    act(() => result.current.actions.setActiveTab('map'));
    expect(result.current.state.activeTab).toBe('map');
  });

  it('selects a course', () => {
    const { result } = renderHook(() => useCoursesApp());
    const course = { id: '00000000-0000-0000-0000-000000000001', code: 'CS101', name: 'Test', name_ar: null, major: 'CS', description: '', credits: 3, semester: 1, is_active: true, created_at: '' };
    act(() => result.current.actions.setSelectedCourse(course));
    expect(result.current.state.selectedCourse).toEqual(course);
  });

  it('calls refetchCourses', () => {
    mockRefetch = vi.fn();
    const { result } = renderHook(() => useCoursesApp());
    act(() => result.current.actions.refetchCourses());
    expect(mockRefetch).toHaveBeenCalled();
  });
});
