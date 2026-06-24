import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateGroupPage from '@/src/features/study-groups/src/pages/CreateGroupPage';

vi.mock('@/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ session: { user: { id: 'user-1' } } })),
}));

vi.mock('@/src/features/study-groups/src/core/services', () => ({
  studyGroupService: {
    createGroup: vi.fn(),
    getCoursesByMajor: vi.fn(),
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

import { studyGroupService } from '@/src/features/study-groups/src/core/services';

describe('CreateGroupPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (studyGroupService.getCoursesByMajor as ReturnType<typeof vi.fn>).mockResolvedValue([
      { code: 'CS101', name: 'Intro CS' },
    ]);
    localStorage.setItem('currentUser', JSON.stringify({ major: 'CS', first_name: 'John', last_name: 'Doe', id: 'user-1' }));
  });

  it('should render page title', () => {
    render(<CreateGroupPage />);
    expect(screen.getByText('إنشاء مجموعة جديدة')).toBeDefined();
  });

  it('should show validation errors on submit with empty form', async () => {
    render(<CreateGroupPage />);
    const submitBtn = screen.getByText('إنشاء المجموعة');
    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(screen.getByText('يرجى إدخال اسم المجموعة')).toBeDefined();
    });
  });
});