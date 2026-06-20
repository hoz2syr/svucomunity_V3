import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('EmptyDashboardState', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be importable', async () => {
    const mod = await import('@/src/pages/Dashboard/EmptyDashboardState');
    expect(mod.EmptyDashboardState).toBeDefined();
  });

  it('should render community title', async () => {
    const { EmptyDashboardState } = await import('@/src/pages/Dashboard/EmptyDashboardState');
    renderWithRouter(<EmptyDashboardState />);
    expect(screen.getByRole('heading', { name: /مرحبا بك،/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: /طالب/ })).toBeTruthy();
  });

  it('should render all feature cards', async () => {
    const { EmptyDashboardState } = await import('@/src/pages/Dashboard/EmptyDashboardState');
    renderWithRouter(<EmptyDashboardState />);
    await waitFor(() => expect(screen.getByText('Study Groups')).toBeDefined());
    expect(screen.getByText('Course Materials')).toBeDefined();
    expect(screen.getByText('Schedule Extraction')).toBeDefined();
    expect(screen.getAllByText('الاختبارات').length).toBeGreaterThanOrEqual(1);
  });
});
