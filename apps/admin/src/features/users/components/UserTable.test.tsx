import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserTable } from './UserTable';
import type { UserRecord } from './UserTable';

const sampleUsers: UserRecord[] = [
  {
    id: '1',
    email: 'admin@svu.com',
    username: 'admin1',
    fullName: 'Admin User',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: '2',
    email: 'user@svu.com',
    username: 'user1',
    fullName: 'Regular User',
    role: 'user',
    status: 'inactive',
    createdAt: '2025-02-01',
  },
];

describe('UserTable', () => {
  it('renders users in table', () => {
    render(
      <UserTable
        users={sampleUsers}
        onBulkExport={vi.fn()}
        onToggleAdmin={vi.fn()}
        onToggleStatus={vi.fn()}
        onViewDetails={vi.fn()}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
      />,
    );

    expect(screen.getByText('admin@svu.com')).toBeTruthy();
    expect(screen.getByText('user@svu.com')).toBeTruthy();
  });

  it('shows empty state when no users', () => {
    render(
      <UserTable
        users={[]}
        onBulkExport={vi.fn()}
        onToggleAdmin={vi.fn()}
        onToggleStatus={vi.fn()}
        onViewDetails={vi.fn()}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
      />,
    );

    expect(screen.getByText('لا يوجد مستخدمون مطابقون.')).toBeTruthy();
  });

  it('calls onViewDetails when view button clicked', () => {
    const onViewDetails = vi.fn();
    render(
      <UserTable
        users={sampleUsers}
        onBulkExport={vi.fn()}
        onToggleAdmin={vi.fn()}
        onToggleStatus={vi.fn()}
        onViewDetails={onViewDetails}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
      />,
    );

    const viewButtons = screen.getAllByTitle('عرض التفاصيل');
    fireEvent.click(viewButtons[0]);
    expect(onViewDetails).toHaveBeenCalledWith(sampleUsers[0]);
  });

  it('disables export when no selection', () => {
    render(
      <UserTable
        users={sampleUsers}
        onBulkExport={vi.fn()}
        onToggleAdmin={vi.fn()}
        onToggleStatus={vi.fn()}
        onViewDetails={vi.fn()}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
      />,
    );

    const exportButton = screen.getByText('Export CSV');
    expect(exportButton.hasAttribute('disabled')).toBe(true);
  });

  it('shows loading skeletons when isLoading true', () => {
    render(
      <UserTable
        users={sampleUsers}
        onBulkExport={vi.fn()}
        onToggleAdmin={vi.fn()}
        onToggleStatus={vi.fn()}
        onViewDetails={vi.fn()}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
        isLoading
      />,
    );

    expect(screen.queryByText('admin@svu.com')).toBeNull();
  });
});
