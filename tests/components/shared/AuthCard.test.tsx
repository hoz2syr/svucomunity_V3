import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseParticleCanvas = vi.fn();
vi.mock('@/src/hooks/useParticleCanvas', () => ({
  useParticleCanvas: (...args: any[]) => mockUseParticleCanvas(...args),
}));

describe('AuthCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockUseParticleCanvas.mockReturnValue({ canvasRef: { current: null }, reducedMotion: true });
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/shared/AuthCard');
    expect(mod.AuthCard).toBeDefined();
  });

  it('should render children', async () => {
    const { AuthCard } = await import('@/src/components/shared/AuthCard');
    render(
      <MemoryRouter>
        <AuthCard
          title="Login"
          isLoading={false}
          serverError=""
          logoGradient="from-cyan-400 to-indigo-500"
          googleButtonText="Sign in with Google"
          onGoogleClick={vi.fn()}
          onSubmit={vi.fn()}
          submitText="Submit"
        >
          <span data-testid="child">child</span>
        </AuthCard>
      </MemoryRouter>
    );
    expect(screen.getByTestId('child')).toBeDefined();
  });
});