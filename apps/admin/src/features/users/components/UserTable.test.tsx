import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { UserTable } from '../components/UserTable';
import type { UserRecord } from '../components/UserTable';

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

    expect(screen.getByText('admin@svu.com')).toBeDefined();
    expect(screen.getByText('user@svu.com')).toBeDefined();
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

    expect(screen.getByText('لا يوجد مستخدمون مطابقون.')).toBeDefined();
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
    viewButtons[0].click();
    expect(onViewDetails).toHaveBeenCalledWith(sampleUsers[0]);
  });

  it('calls onToggleAdmin when toggle admin clicked', () => {
    const onToggleAdmin = vi.fn();
    render(
      <UserTable
        users={sampleUsers}
        onBulkExport={vi.fn()}
        onToggleAdmin={onToggleAdmin}
        onToggleStatus={vi.fn()}
        onViewDetails={vi.fn()}
        selectedIds={[]}
        onSelectedIdsChange={vi.fn()}
      />,
    );

    const adminButtons = screen.getAllByTitle('إزالة صلاحية الأدمن');
    adminButtons[0].click();
    expect(onToggleAdmin).toHaveBeenCalledWith(sampleUsers[0], false);
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

  it('shows selected count when users selected', () => {
    render(
      <UserTable
        users={sampleUsers}
        onBulkExport={vi.fn()}
        onToggleAdmin={vi.fn()}
        onToggleStatus={vi.fn()}
        onViewDetails={vi.fn()}
        selectedIds={['1']}
        onSelectedIdsChange={vi.fn()}
      />,
    );

    expect(screen.getByText('1 محدد')).toBeDefined();
  });
});
