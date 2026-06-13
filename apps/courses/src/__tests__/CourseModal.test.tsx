import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CourseModal } from '../components/course-modal';

const mockCourse = {
  id: '00000000-0000-0000-0000-000000000001',
  code: 'CS101',
  name: 'Intro to CS',
  name_ar: 'مقدمة في الحاسوب',
  major: 'CS',
  description: 'A foundational course',
  is_active: true,
  created_at: '',
};

const mockResources = [
  {
    id: '1',
    course_code: 'CS101',
    title: 'Lecture 1',
    resource_type: 'PDF',
    url: 'https://example.com/lecture1.pdf',
    description: 'First lecture',
    uploader_name: 'Dr. Smith',
  },
  {
    id: '2',
    course_code: 'CS101',
    title: 'Video 1',
    resource_type: 'فيديو',
    url: 'https://example.com/video1.mp4',
    description: '',
    uploader_name: 'Dr. Jones',
  },
];

vi.mock('../hooks/useCourseResources', () => ({
  useCourseResources: vi.fn(),
}));

import { useCourseResources } from '../hooks/useCourseResources';

describe('CourseModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with course data correctly', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [],
      loading: false,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('مقدمة في الحاسوب')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
    expect(screen.getByText('CS')).toBeInTheDocument();
    expect(screen.getByText('معلومات المادة')).toBeInTheDocument();
    expect(screen.getByText('موارد الطلاب')).toBeInTheDocument();
  });

  it('shows course info tab by default', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [],
      loading: false,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    expect(screen.getByText('وصف المادة')).toBeInTheDocument();
    expect(screen.getByText('A foundational course')).toBeInTheDocument();
    expect(screen.getByText('رمز المقرر')).toBeInTheDocument();
    expect(screen.getByText('التخصص')).toBeInTheDocument();
    expect(screen.getByText('الاسم بالإنجليزية')).toBeInTheDocument();
  });

  it('shows resources tab when clicked', async () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: mockResources,
      loading: false,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    const resourcesTab = screen.getByText('موارد الطلاب');
    fireEvent.click(resourcesTab);

    await waitFor(() => {
      expect(screen.getByText('Lecture 1')).toBeInTheDocument();
      expect(screen.getByText('Video 1')).toBeInTheDocument();
    });
  });

  it('handles empty resources list', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [],
      loading: false,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    const resourcesTab = screen.getByText('موارد الطلاب');
    fireEvent.click(resourcesTab);

    expect(screen.getByText('لا توجد موارد مضافة لهذه المادة بعد')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [],
      loading: false,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('إغلاق');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders external links safely', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [
        {
          id: '1',
          course_code: 'CS101',
          title: 'Valid Link',
          resource_type: 'رابط',
          url: 'https://example.com',
          description: '',
          uploader_name: 'Admin',
        },
        {
          id: '2',
          course_code: 'CS101',
          title: 'Invalid Link',
          resource_type: 'رابط',
          url: 'javascript:alert(1)',
          description: '',
          uploader_name: 'Admin',
        },
      ],
      loading: false,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    const resourcesTab = screen.getByText('موارد الطلاب');
    fireEvent.click(resourcesTab);

    expect(screen.getByText('Valid Link')).toBeInTheDocument();
    expect(screen.getByText('Invalid Link')).toBeInTheDocument();
    expect(screen.getByText('رابط غير صالح — OS: هذا المورد غير متاح حالياً')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [],
      loading: true,
      error: null,
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    const resourcesTab = screen.getByText('موارد الطلاب');
    fireEvent.click(resourcesTab);

    expect(screen.getByText('جارٍ تحميل الموارد...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useCourseResources as ReturnType<typeof vi.fn>).mockReturnValue({
      resources: [],
      loading: false,
      error: 'فشل في تحميل البيانات',
    });

    render(<CourseModal course={mockCourse} onClose={mockOnClose} />);

    const resourcesTab = screen.getByText('موارد الطلاب');
    fireEvent.click(resourcesTab);

    expect(screen.getByText('حدث خطأ في تحميل الموارد')).toBeInTheDocument();
    expect(screen.getByText('فشل في تحميل البيانات')).toBeInTheDocument();
  });
});
