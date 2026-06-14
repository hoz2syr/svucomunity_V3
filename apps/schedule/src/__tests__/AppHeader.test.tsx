import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader } from '../components/AppHeader';
import type { User, Profile } from '@svu-community/types';

type DisplayUser = (User | Profile) & {
  display_name?: string | null;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
};

vi.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('lucide-react', () => ({
  BookOpen: () => null,
  LogOut: () => null,
}));

describe('AppHeader', () => {
  it('renders UniSync title', () => {
    render(<AppHeader user={null} onLogin={() => {}} onLogout={() => {}} />);
    expect(screen.getByText('UniSync')).toBeDefined();
  });

  it('shows Sign In button when user is null', () => {
    render(<AppHeader user={null} onLogin={() => {}} onLogout={() => {}} />);
    expect(screen.getByText('Sign In')).toBeDefined();
  });

  it('calls onLogin when Sign In clicked', () => {
    const onLogin = vi.fn();
    render(<AppHeader user={null} onLogin={onLogin} onLogout={() => {}} />);
    fireEvent.click(screen.getByText('Sign In'));
    expect(onLogin).toHaveBeenCalledOnce();
  });

  it('shows user info and logout when logged in', () => {
    const user: DisplayUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      first_name: 'Test',
      last_name: 'User',
      display_name: 'Test User',
    };
    render(<AppHeader user={user} onLogin={() => {}} onLogout={() => {}} />);
    expect(screen.getByText('Test User')).toBeDefined();
    expect(screen.getByText('test@example.com')).toBeDefined();
  });

  it('renders username when display_name and first/last name are absent', () => {
    const user: DisplayUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    render(<AppHeader user={user} onLogin={() => {}} onLogout={() => {}} />);
    expect(screen.getByText('testuser')).toBeDefined();
  });

  it('renders avatar image when avatar_url is set', () => {
    const user: DisplayUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      display_name: 'T',
      avatar_url: 'https://example.com/avatar.png',
    };
    render(<AppHeader user={user} onLogin={() => {}} onLogout={() => {}} />);
    const img = screen.getByRole('img');
    expect(img).toBeDefined();
    expect((img as HTMLImageElement).src).toBe('https://example.com/avatar.png');
  });

  it('calls onLogout when logout clicked', () => {
    const onLogout = vi.fn();
    const user: DisplayUser = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      is_admin: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      first_name: 'Test',
      last_name: 'User',
    };
    render(<AppHeader user={user} onLogin={() => {}} onLogout={onLogout} />);
    fireEvent.click(screen.getByLabelText('Sign out'));
    expect(onLogout).toHaveBeenCalledOnce();
  });
});
