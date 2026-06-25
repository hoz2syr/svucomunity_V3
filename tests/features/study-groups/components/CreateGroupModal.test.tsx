import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateGroupModal } from '@/src/features/study-groups/components/CreateGroupModal';

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const mockCourses = [
  { code: 'CS101', name: 'مقدمة في علوم الحاسب', major: 'علوم الحاسب' },
];

const mockGetCoursesByMajor = vi.fn(() => Promise.resolve(mockCourses));

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
  userMajor: 'علوم الحاسب',
  getCoursesByMajor: mockGetCoursesByMajor,
  availableMajors: ['علوم الحاسب', 'هندسة'],
};

describe('CreateGroupModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<CreateGroupModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('إنشاء مجموعة جديدة')).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<CreateGroupModal {...defaultProps} />);
    expect(screen.getByText('إنشاء مجموعة جديدة')).toBeDefined();
  });

  it('should call onClose when close button clicked', () => {
    render(<CreateGroupModal {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should populate major from currentUser when opened', async () => {
    render(<CreateGroupModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCoursesByMajor).toHaveBeenCalledWith('علوم الحاسب'));
  });

  it('should show validation errors when submitting empty form', async () => {
    render(<CreateGroupModal {...defaultProps} currentUser={null} />);
    const submitButton = screen.getByRole('button', { name: /إنشاء المجموعة/i });
    fireEvent.click(submitButton);
    expect(screen.getByText('يرجى إدخال اسم المجموعة')).toBeDefined();
  });

  it('should render class dropdown options', async () => {
    render(<CreateGroupModal {...defaultProps} />);
    const classDropdown = screen.getAllByText('اختر الصف...')[0];
    expect(classDropdown).toBeDefined();
  });

  it('should open course dropdown and show course options', async () => {
    render(<CreateGroupModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('اختر المادة...')).toBeDefined());
    const courseButton = screen.getByText('اختر المادة...').closest('button');
    if (courseButton) fireEvent.click(courseButton);
    await waitFor(() => expect(screen.getByText('مقدمة في علوم الحاسب')).toBeDefined());
  });
});
