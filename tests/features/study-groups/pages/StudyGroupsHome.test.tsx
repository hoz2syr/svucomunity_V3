import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@/src/features/study-groups/src/hooks/useStudyGroups', () => ({
  useStudyGroups: vi.fn(),
}));

vi.mock('@/src/features/study-groups/src/services/studyGroup.supabase', () => {
  const getAvailableMajors = vi.fn(() => Promise.resolve([]));
  return {
    getSupabase: vi.fn(() => ({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => Promise.resolve({ data: null, error: null })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    getAllWithCreators: vi.fn(() => Promise.resolve([])),
    getCreators: vi.fn(() => Promise.resolve({})),
    getCoursesByMajor: vi.fn(() => Promise.resolve([])),
    getAvailableMajors,
    joinGroup: vi.fn(() => Promise.resolve(undefined)),
    createGroup: vi.fn(() => Promise.resolve({})),
    deleteGroup: vi.fn(() => Promise.resolve(undefined)),
    getGroupMembers: vi.fn(() => Promise.resolve([])),
    checkMembership: vi.fn(() => Promise.resolve(false)),
    checkIsAdmin: vi.fn(() => Promise.resolve(false)),
  };
});

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ session: null })),
}));

vi.mock('@/src/features/study-groups/src/hooks/useStudyGroupsPage', () => ({
  useStudyGroupsPage: vi.fn(() => ({
    showCreateModal: false,
    handleOpenCreateModal: vi.fn(),
    handleCloseCreateModal: vi.fn(),
    selectedGroupId: null,
    selectedGroup: null,
    isMember: false,
    joiningId: null,
    majors: [],
    classes: [],
    currentUser: null,
    isAdmin: false,
    showDeleteConfirm: false,
    setShowDeleteConfirm: vi.fn(),
    handleCreateGroup: vi.fn(),
    handleOpenDetails: vi.fn(),
    handleCloseDetails: vi.fn(),
    handleJoinGroup: vi.fn(),
    handleDeleteGroup: vi.fn(),
    handleGetCoursesByMajor: vi.fn(),
    canDelete: false,
    groups: [],
    loading: false,
    error: null,
    filters: { search: '', major: '', course_code: '', class_number: '', status: 'all' },
    updateFilter: vi.fn(),
    clearFilters: vi.fn(),
    courses: [],
    reload: vi.fn(),
    onSearchChange: vi.fn(),
  })),
}));

vi.mock('@/src/features/study-groups/components/StudyGroupsFilters', () => ({
  StudyGroupsFilters: () => <div data-testid="study-groups-filters">Filters</div>,
}));

vi.mock('@/src/features/study-groups/components/GroupCard', () => ({
  GroupCard: ({ group }: { group: any }) => (
    <div data-testid={`group-card-${group.id}`}>{group.name}</div>
  ),
}));

vi.mock('@/src/features/study-groups/components/CreateGroupModal', () => ({
  CreateGroupModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="create-group-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      Create Group Modal
    </div>
  ),
}));

vi.mock('@/src/features/study-groups/components/GroupDetailsModal', () => ({
  GroupDetailsModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="group-details-modal" style={{ display: isOpen ? 'block' : 'none' }}>
      Group Details Modal
    </div>
  ),
}));

import StudyGroupsHome from '@/src/features/study-groups/src/pages/StudyGroupsHome';
import { useStudyGroupsPage } from '@/src/features/study-groups/src/hooks/useStudyGroupsPage';

describe('StudyGroupsHome page', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const baseMockReturn = {
    showCreateModal: false,
    handleOpenCreateModal: vi.fn(),
    handleCloseCreateModal: vi.fn(),
    selectedGroupId: null,
    selectedGroup: null,
    isMember: false,
    joiningId: null,
    majors: [],
    classes: [],
    currentUser: null,
    isAdmin: false,
    showDeleteConfirm: false,
    setShowDeleteConfirm: vi.fn(),
    handleCreateGroup: vi.fn(),
    handleOpenDetails: vi.fn(),
    handleCloseDetails: vi.fn(),
    handleJoinGroup: vi.fn(),
    handleDeleteGroup: vi.fn(),
    handleGetCoursesByMajor: vi.fn(),
    canDelete: false,
    groups: [],
    loading: false,
    error: null,
    filters: { search: '', major: '', course_code: '', class_number: '', status: 'all' },
    updateFilter: vi.fn(),
    clearFilters: vi.fn(),
    courses: [],
    reload: vi.fn(),
    onSearchChange: vi.fn(),
  };

  it('should render layout with filters', async () => {
    (useStudyGroupsPage as any).mockReturnValue(baseMockReturn);

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    expect(screen.getByTestId('study-groups-filters')).toBeDefined();
  });

  it('should render the page title', async () => {
    (useStudyGroupsPage as any).mockReturnValue(baseMockReturn);

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    expect(screen.getByText('المجموعات الدراسية')).toBeDefined();
  });

  it('should render group cards when groups exist', async () => {
    (useStudyGroupsPage as any).mockReturnValue({
      ...baseMockReturn,
      groups: [
        { id: '1', name: 'Group A', major: 'CS', current_members: 3, max_members: 5 },
        { id: '2', name: 'Group B', major: 'Eng', current_members: 10, max_members: 10 },
      ],
    });

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    expect(screen.getByTestId('group-card-1')).toBeDefined();
    expect(screen.getByTestId('group-card-2')).toBeDefined();
  });

  it('should render empty state when no groups exist', async () => {
    (useStudyGroupsPage as any).mockReturnValue({
      ...baseMockReturn,
      groups: [],
      loading: false,
      error: null,
    });

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    expect(screen.getByText('لا توجد مجموعات')).toBeDefined();
    expect(screen.getByText('كن أول من يُنشئ مجموعة!')).toBeDefined();
  });

  it('should render error state when error occurs', async () => {
    (useStudyGroupsPage as any).mockReturnValue({
      ...baseMockReturn,
      loading: false,
      error: 'فشل تحميل البيانات',
    });

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    expect(screen.getByText('حدث خطأ في التحميل')).toBeDefined();
    expect(screen.getByText('فشل تحميل البيانات')).toBeDefined();
  });

  it('should render loading skeletons when loading', async () => {
    (useStudyGroupsPage as any).mockReturnValue({
      ...baseMockReturn,
      loading: true,
      groups: [],
    });

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    const { container } = render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render skeleton count based on grid', async () => {
    (useStudyGroupsPage as any).mockReturnValue({
      ...baseMockReturn,
      loading: true,
      groups: [],
    });

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    const { container } = render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(8);
  });

  it('should render the floating action button on mobile', async () => {
    (useStudyGroupsPage as any).mockReturnValue(baseMockReturn);

    const { default: Page } = await import('@/src/features/study-groups/src/pages/StudyGroupsHome');
    const { container } = render(
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    );
    const fab = container.querySelector('.sm\\:hidden.fixed');
    expect(fab).toBeDefined();
  });
});
