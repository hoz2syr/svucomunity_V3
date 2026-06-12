import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsTab } from '../components/ResultsTab';

vi.mock('motion/react', () => ({
  motion: { div: ({ children, ...props }: any) => <div {...props}>{children}</div> },
}));

vi.mock('@/components/ui/Card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

vi.mock('lucide-react', () => ({
  AlertCircle: (props: any) => <span data-testid="alert-icon" {...props} />,
  Users: (props: any) => <span data-testid="users-icon" {...props} />,
  UserPlus: (props: any) => <span data-testid="user-plus" {...props} />,
  UserMinus: (props: any) => <span data-testid="user-minus" {...props} />,
  Plus: (props: any) => <span data-testid="plus-icon" {...props} />,
}));

const user = { id: 'user-1' };
const extractionResult = {
  major: 'Computer Science',
  courses: [
    { code: 'CS101', name: 'Intro to CS', section: 'A' } as any,
  ],
};
const availableGroups: Record<string, any[]> = {};
const onJoinGroup = vi.fn();
const onLeaveGroup = vi.fn();
const onCreateGroup = vi.fn();
const onReupload = vi.fn();
const onLoadMore = vi.fn();

const baseProps = {
  extractionResult,
  availableGroups,
  user,
  error: null,
  isActionLoading: false,
  hasMore: {} as Record<string, boolean>,
  isLoadingMore: {} as Record<string, boolean>,
  onJoinGroup,
  onLeaveGroup,
  onCreateGroup,
  onReupload,
  onLoadMore,
};

describe('ResultsTab', () => {
  it('returns null when no user', () => {
    const { container } = render(<ResultsTab {...baseProps} user={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when no extractionResult', () => {
    const { container } = render(<ResultsTab {...baseProps} extractionResult={null} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders extracted courses heading', () => {
    render(<ResultsTab {...baseProps} />);
    expect(screen.getByText('Extracted Courses')).toBeDefined();
    expect(screen.getByText('Major: Computer Science')).toBeDefined();
  });

  it('renders course code and name', () => {
    render(<ResultsTab {...baseProps} />);
    expect(screen.getByText('CS101')).toBeDefined();
    expect(screen.getByText('Intro to CS')).toBeDefined();
  });

  it('shows error alert when error is set', () => {
    render(<ResultsTab {...baseProps} error="API failed" />);
    expect(screen.getByText('API failed')).toBeDefined();
  });

  it('shows No groups found and Create Group when no groups', () => {
    render(<ResultsTab {...baseProps} />);
    expect(screen.getByText('No groups found for this course')).toBeDefined();
    expect(screen.getByText('Create Group')).toBeDefined();
  });

  it('calls onCreateGroup when Create Group clicked', () => {
    render(<ResultsTab {...baseProps} />);
    fireEvent.click(screen.getByText('Create Group'));
    expect(onCreateGroup).toHaveBeenCalledOnce();
  });

  it('calls onReupload when Re-upload clicked', () => {
    render(<ResultsTab {...baseProps} />);
    fireEvent.click(screen.getByText('Re-upload'));
    expect(onReupload).toHaveBeenCalledOnce();
  });

  it('shows Join button when groups exist', () => {
    const groups = [{ id: 'g1', name: 'Study A', members: [] }];
    render(<ResultsTab {...baseProps} availableGroups={{ 'CS101': groups }} />);
    expect(screen.getByText('Study A')).toBeDefined();
    expect(screen.getByText('Join')).toBeDefined();
  });

  it('calls onJoinGroup when Join button clicked', () => {
    const groups = [{ id: 'g1', name: 'Study A', members: [] }];
    render(<ResultsTab {...baseProps} availableGroups={{ 'CS101': groups }} />);
    fireEvent.click(screen.getByText('Join'));
    expect(onJoinGroup).toHaveBeenCalledWith('g1', []);
  });

  it('shows Leave button when user is member', () => {
    const groups = [{ id: 'g1', name: 'Study A', members: ['user-1'] }];
    render(<ResultsTab {...baseProps} availableGroups={{ 'CS101': groups }} />);
    expect(screen.getByText('Leave')).toBeDefined();
  });

  it('calls onLeaveGroup when Leave clicked', () => {
    const groups = [{ id: 'g1', name: 'Study A', members: ['user-1'] }];
    render(<ResultsTab {...baseProps} availableGroups={{ 'CS101': groups }} />);
    fireEvent.click(screen.getByText('Leave'));
    expect(onLeaveGroup).toHaveBeenCalledWith('g1', ['user-1']);
  });

  it('calls onLoadMore with course code when Load More clicked', () => {
    render(<ResultsTab {...baseProps} hasMore={{ CS101: true }} />);
    fireEvent.click(screen.getByText('Load More'));
    expect(onLoadMore).toHaveBeenCalledWith('CS101');
  });

  it('disables action buttons when isActionLoading is true', () => {
    const groups = [{ id: 'g1', name: 'Study A', members: [] }];
    render(<ResultsTab {...baseProps} availableGroups={{ 'CS101': groups }} isActionLoading={true} />);
    expect(screen.getByText('Join').closest('button')?.hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('Leave').closest('button')?.hasAttribute('disabled')).toBe(true)
    expect(screen.getByText('Create Group').closest('button')?.hasAttribute('disabled')).toBe(true)
  });
});
