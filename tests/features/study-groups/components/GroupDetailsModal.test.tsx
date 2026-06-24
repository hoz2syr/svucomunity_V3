import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GroupDetailsModal } from '@/src/features/study-groups/components/GroupDetailsModal';

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
  group: mockGroup,
  isOpen: true,
  onClose: vi.fn(),
  isMember: false,
  canDelete: false,
  onJoin: vi.fn(),
  onDelete: vi.fn(),
  joiningId: null,
};

describe('GroupDetailsModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(<GroupDetailsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('مجموعة مراجعة C1')).toBeNull();
  });

  it('should not render when group is null', () => {
    render(<GroupDetailsModal {...defaultProps} group={null} />);
    expect(screen.queryByText('مجموعة مراجعة C1')).toBeNull();
  });

  it('should render group name', () => {
    render(<GroupDetailsModal {...defaultProps} />);
    expect(screen.getByText('مجموعة مراجعة C1')).toBeDefined();
  });

  it('should render course code', () => {
    render(<GroupDetailsModal {...defaultProps} />);
    expect(screen.getByText('CS101')).toBeDefined();
  });

  it('should render course name', () => {
    render(<GroupDetailsModal {...defaultProps} />);
    expect(screen.getByText('مقدمة في علوم الحاسب')).toBeDefined();
  });

  it('should render major', () => {
    render(<GroupDetailsModal {...defaultProps} />);
    expect(screen.getByText('علوم الحاسب')).toBeDefined();
  });

  it('should show join button when not member and not full', () => {
    render(<GroupDetailsModal {...defaultProps} />);
    expect(screen.getByText('انضم للمجموعة')).toBeDefined();
  });

  it('should show member status when isMember is true', () => {
    render(<GroupDetailsModal {...defaultProps} isMember={true} />);
    expect(screen.getByText('أنت عضو في هذه المجموعة')).toBeDefined();
  });

  it('should show full status when isFull is true', () => {
    const fullGroup = { ...mockGroup, current_members: 5, max_members: 5 };
    render(<GroupDetailsModal {...defaultProps} group={fullGroup} isMember={false} />);
    expect(screen.getByText('المجموعة ممتلئة')).toBeDefined();
  });

  it('should show delete button when canDelete is true', () => {
    render(<GroupDetailsModal {...defaultProps} canDelete={true} />);
    expect(screen.getByText('حذف المجموعة')).toBeDefined();
  });

  it('should call onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<GroupDetailsModal {...defaultProps} onClose={onClose} />);
    const closeButtons = screen.getAllByRole('button');
    const modalCloseButton = closeButtons.find(btn => btn.classList.contains('absolute'));
    if (modalCloseButton) fireEvent.click(modalCloseButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('should show confirm join when join button clicked', async () => {
    render(<GroupDetailsModal {...defaultProps} />);
    fireEvent.click(screen.getByText('انضم للمجموعة'));
    await waitFor(() => expect(screen.getByText('تأكيد الانضمام')).toBeDefined());
  });

  it('should call onJoin when confirm join clicked', async () => {
    const onJoin = vi.fn();
    render(<GroupDetailsModal {...defaultProps} onJoin={onJoin} />);
    fireEvent.click(screen.getByText('انضم للمجموعة'));
    await waitFor(() => fireEvent.click(screen.getByText('تأكيد الانضمام')));
    expect(onJoin).toHaveBeenCalledWith('1');
  });

  it('should call onDelete when delete confirmed', async () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();
    render(<GroupDetailsModal {...defaultProps} canDelete={true} onDelete={onDelete} onClose={onClose} />);
    fireEvent.click(screen.getByText('حذف المجموعة'));
    await waitFor(() => fireEvent.click(screen.getByText('نعم، احذف')));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
