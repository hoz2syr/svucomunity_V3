import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: (...args: any[]) => mockUseAuth(...args),
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/ProtectedRoute');
    expect(mod.ProtectedRoute).toBeDefined();
  });

  it('should render children when authenticated', async () => {
    mockUseAuth.mockReturnValue({
      session: { user: { id: '1' } },
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    const { ProtectedRoute } = await import('@/src/components/ProtectedRoute');
    renderWithRouter(
      <ProtectedRoute>
        <span data-testid="protected-child">protected</span>
      </ProtectedRoute>
    );
    expect(screen.getByTestId('protected-child')).toBeDefined();
  });

  it('should render nothing when unauthenticated', async () => {
    mockUseAuth.mockReturnValue({
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    const { ProtectedRoute } = await import('@/src/components/ProtectedRoute');
    renderWithRouter(
      <ProtectedRoute>
        <span data-testid="protected-child">protected</span>
      </ProtectedRoute>
    );
    expect(screen.queryByTestId('protected-child')).toBeNull();
  });
});