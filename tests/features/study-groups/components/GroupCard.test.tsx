import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupCard } from '@/src/features/study-groups/components/GroupCard';

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

describe('GroupCard component', () => {
  it('should render group name', () => {
    render(<GroupCard group={mockGroup} onClick={vi.fn()} />);
    expect(screen.getByText('مجموعة مراجعة C1')).toBeDefined();
  });

  it('should render course code', () => {
    render(<GroupCard group={mockGroup} onClick={vi.fn()} />);
    expect(screen.getByText('CS101')).toBeDefined();
  });

  it('should call onClick with group id when clicked', () => {
    const onClick = vi.fn();
    render(<GroupCard group={mockGroup} onClick={onClick} />);
    fireEvent.click(screen.getByText('مجموعة مراجعة C1'));
    expect(onClick).toHaveBeenCalledWith('1');
  });

  it('should show available status when not full', () => {
    render(<GroupCard group={mockGroup} onClick={vi.fn()} />);
    expect(screen.getByText('● متاحة')).toBeDefined();
  });

  it('should show full status when full', () => {
    const fullGroup = { ...mockGroup, current_members: 5, max_members: 5 };
    render(<GroupCard group={fullGroup} onClick={vi.fn()} />);
    expect(screen.getByText('● ممتلئة')).toBeDefined();
  });

  it('should render course name', () => {
    render(<GroupCard group={mockGroup} onClick={vi.fn()} />);
    expect(screen.getByText('مقدمة في علوم الحاسب')).toBeDefined();
  });

  it('should render major', () => {
    render(<GroupCard group={mockGroup} onClick={vi.fn()} />);
    expect(screen.getByText('علوم الحاسب')).toBeDefined();
  });
});
