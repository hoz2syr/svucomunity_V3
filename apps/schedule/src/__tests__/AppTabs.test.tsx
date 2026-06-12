import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppTabs } from '../components/AppTabs';

vi.mock('@/lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));
const mockUseAuth = vi.fn(() => ({ user: { id: '1' } }));
vi.mock('@svu-community/ui', () => ({ useAuth: mockUseAuth }));

describe('AppTabs', () => {
  const defaultProps = {
    activeTab: 'upload' as const,
    onTabChange: vi.fn(),
    hasResult: false,
  };

  it('returns null when no authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { container } = render(<AppTabs {...defaultProps} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders both tab buttons when user present', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    render(<AppTabs {...defaultProps} />);
    expect(screen.getByText('Upload Schedule')).toBeDefined();
    expect(screen.getByText('Matching Groups')).toBeDefined();
  });

  it('calls onTabChange with upload', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    const onTabChange = vi.fn();
    render(<AppTabs {...defaultProps} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByText('Upload Schedule'));
    expect(onTabChange).toHaveBeenCalledWith('upload');
  });

  it('calls onTabChange with results', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    const onTabChange = vi.fn();
    render(<AppTabs {...defaultProps} onTabChange={onTabChange} hasResult />);
    fireEvent.click(screen.getByText('Matching Groups'));
    expect(onTabChange).toHaveBeenCalledWith('results');
  });

  it('disables Matching Groups tab when no result', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    render(<AppTabs {...defaultProps} hasResult={false} />);
    expect((screen.getByText('Matching Groups') as HTMLButtonElement).disabled).toBe(true);
  });
});
