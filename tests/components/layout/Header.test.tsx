import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Header', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/layout/Header');
    expect(mod.Header).toBeDefined();
  });

  it('should render header element', async () => {
    const { Header } = await import('@/src/components/layout/Header');
    render(<Header />);
    expect(screen.queryByRole('banner') || document.querySelector('header')).toBeTruthy();
  });
});
