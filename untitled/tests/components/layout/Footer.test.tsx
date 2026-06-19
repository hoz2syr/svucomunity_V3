import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Footer', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/layout/Footer');
    expect(mod.Footer).toBeDefined();
  });

  it('should render footer', async () => {
    const { Footer } = await import('@/src/components/layout/Footer');
    renderWithRouter(<Footer />);
    expect(document.querySelector('footer')).toBeTruthy();
  });
});