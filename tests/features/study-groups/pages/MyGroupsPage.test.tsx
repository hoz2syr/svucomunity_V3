import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MyGroupsPage from '@/src/features/study-groups/src/pages/MyGroupsPage';

const mockGroups = [
  {
    id: '1',
    name: 'G1',
    course_code: 'CS101',
    course_name: 'Intro CS',
    major: 'CS',
    current_members: 3,
    max_members: 5,
    whatsapp_link: 'https://wa.me/1',
    creator_name: 'A',
    creator_id: 'user-1',
    created_at: '2024-01-01',
  },
];

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ session: { user: { id: 'user-1' } } })),
}));

vi.mock('@/src/features/study-groups/src/core/services', () => ({
  studyGroupService: {
    getMyGroups: vi.fn(),
  },
}));

import { studyGroupService } from '@/src/features/study-groups/src/core/services';

describe('MyGroupsPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no groups', async () => {
    (studyGroupService.getMyGroups as ReturnType<typeof vi.fn>).mockResolvedValue({
      created: [],
      joined: [],
    });
    render(<MyGroupsPage />);
    await waitFor(() => {
      expect(screen.getByText('أنت لست عضو في أي مجموعة بعد')).toBeDefined();
    });
  });

  it('should render created groups section', async () => {
    (studyGroupService.getMyGroups as ReturnType<typeof vi.fn>).mockResolvedValue({
      created: [mockGroups[0]],
      joined: [],
    });
    render(<MyGroupsPage />);
    await waitFor(() => {
      expect(screen.getByText(/المجموعات التي أنشأتها/)).toBeDefined();
    });
  });
});