import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Navbar', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/components/layout/Navbar');
    expect(mod.Navbar).toBeDefined();
  });

  it('should render navbar', async () => {
    const { Navbar } = await import('@/src/components/layout/Navbar');
    renderWithRouter(<Navbar />);
    expect(document.querySelector('nav')).toBeTruthy();
  });
});