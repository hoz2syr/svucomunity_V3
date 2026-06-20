import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('ServerError', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/ui/ServerError');
    expect(mod.ServerError).toBeDefined();
  });

  it('should render error when provided', async () => {
    const { ServerError } = await import('@/src/components/ui/ServerError');
    render(<ServerError error="Custom error" />);
    expect(screen.queryByText('Custom error')).toBeTruthy();
  });

  it('should not render when error is empty', async () => {
    const { ServerError } = await import('@/src/components/ui/ServerError');
    render(<ServerError error="" />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});