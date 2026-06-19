import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('AuthButton', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable with named export', async () => {
    const mod = await import('@/src/components/ui/AuthButton');
    expect(mod.AuthButton).toBeDefined();
  });

  it('should render an AuthButton', async () => {
    const { AuthButton } = await import('@/src/components/ui/AuthButton');
    render(<AuthButton defaultText="Submit" />);
    expect(screen.queryByRole('button')).toBeTruthy();
  });
});
