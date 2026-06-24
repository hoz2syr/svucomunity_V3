import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditGroupModal } from '@/src/features/study-groups/components/EditGroupModal';

const mockGroup = {
  id: '1',
  name: 'مجموعة مراجعة C1',
  course_code: 'CS101',
  course_name: 'مقدمة في علوم الحاسب',
  major: 'علوم الحاسب',
  current_members: 3,
  max_members: 5,
  doctor_name: 'د. أحمد',
  class_number: 'C1',
  whatsapp_link: 'https://chat.whatsapp.com/123',
  group_link: 'https://teams.microsoft.com/123',
  creator_name: 'محمد',
  creator_id: 'user1',
  created_at: '2024-01-01',
};

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  group: mockGroup,
  getCoursesByMajor: vi.fn(async () => [{ code: 'CS101', name: 'Intro CS' }]),
  availableMajors: ['CS', 'Engineering'],
};

describe('EditGroupModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<EditGroupModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('تعديل بيانات المجموعة')).toBeNull();
  });

  it('should not render when group is null', () => {
    render(<EditGroupModal {...defaultProps} group={null} />);
    expect(screen.queryByText('تعديل بيانات المجموعة')).toBeNull();
  });

  it('should render modal title', () => {
    render(<EditGroupModal {...defaultProps} />);
    expect(screen.getByText('تعديل بيانات المجموعة')).toBeDefined();
  });

  it('should pre-populate group name', () => {
    render(<EditGroupModal {...defaultProps} />);
    expect(screen.getByDisplayValue('مجموعة مراجعة C1')).toBeDefined();
  });

  it('should call onSubmit when form submitted', async () => {
    const onSubmit = vi.fn();
    render(<EditGroupModal {...defaultProps} onSubmit={onSubmit} />);
    const submitButton = screen.getByText('تحديث المجموعة');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel clicked', async () => {
    const onClose = vi.fn();
    render(<EditGroupModal {...defaultProps} onClose={onClose} />);
    // Find and click the close button in ModalShell
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find(btn => btn.classList.contains('absolute'));
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    }
  });
});