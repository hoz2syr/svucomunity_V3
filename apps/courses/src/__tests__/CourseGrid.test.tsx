import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CourseGrid } from '../components/course-grid';

const mockCourses = [
  { id: '00000000-0000-0000-0000-000000000001', code: 'CS101', name: 'Intro', name_ar: 'مقدمة', major: 'CS', description: '', is_active: true, created_at: '' },
];

describe('CourseGrid', () => {
  it('renders course cards', () => {
    render(<CourseGrid courses={mockCourses} onCourseClick={() => {}} />);
    expect(screen.getByText('مقدمة')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
  });

  it('calls onCourseClick with course', () => {
    const onClick = vi.fn();
    render(<CourseGrid courses={mockCourses} onCourseClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /CS101/ }));
    expect(onClick).toHaveBeenCalledWith(mockCourses[0]);
  });

  it('renders empty grid when no courses', () => {
    render(<CourseGrid courses={[]} onCourseClick={() => {}} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('falls back to English name when name_ar is null', () => {
    const courseNoAr = { id: '00000000-0000-0000-0000-000000000001', code: 'CS102', name: 'Intro English', name_ar: null, major: 'CS', description: '', is_active: true, created_at: '' };
    render(<CourseGrid courses={[courseNoAr]} onCourseClick={() => {}} />);
    expect(screen.getByText('Intro English')).toBeInTheDocument();
  });
});
