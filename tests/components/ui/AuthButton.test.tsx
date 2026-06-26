import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/src/components/ui/Button';

describe('Button (auth variant)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable with named export', async () => {
    const mod = await import('@/src/components/ui/Button');
    expect(mod.Button).toBeDefined();
  });

  it('should render an auth button', async () => {
    render(<Button variant="auth">Submit</Button>);
    expect(screen.queryByRole('button')).toBeTruthy();
  });

  it('should show loading state', async () => {
    render(<Button variant="auth" isLoading loadingText="Loading...">Submit</Button>);
    expect(screen.queryByText('Loading...')).toBeTruthy();
  });
});
