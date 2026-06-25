import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useStudyGroups } from '@/src/features/study-groups/src/hooks/useStudyGroups';

const mockGetAllWithCreators = vi.fn();
const mockGetCreators = vi.fn();

vi.mock('@/src/features/study-groups/src/core/services', () => ({
  studyGroupService: {
    getAllWithCreators: () => mockGetAllWithCreators(),
  },
  getCreators: () => mockGetCreators(),
}));

const mockGroups = [
  {
    id: '1',
    name: 'Study Group A',
    course_name: 'Mathematics',
    course_code: 'MATH101',
    major: 'CS',
    max_members: 5,
    current_members: 3,
    whatsapp_link: 'https://wa.me/1',
    group_link: '',
    creator_id: 'user1',
    creator_name: 'Ali Hassan',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Study Group B',
    course_name: 'Physics',
    course_code: 'PHYS101',
    major: 'Engineering',
    max_members: 10,
    current_members: 10,
    whatsapp_link: 'https://wa.me/2',
    group_link: '',
    creator_id: 'user2',
    creator_name: 'Sara',
    created_at: '2024-01-02T00:00:00Z',
  },
];

describe('useStudyGroups hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllWithCreators.mockReset();
    mockGetCreators.mockReset();
  });

  it('should return loading state initially when userId is provided', async () => {
    mockGetAllWithCreators.mockResolvedValue([]);
    const { result } = renderHook(() => useStudyGroups('user123'));
    expect(result.current.loading).toBe(true);
    expect(result.current.status).toBe('loading');
  });

  it('should load and return groups successfully', async () => {
    mockGetAllWithCreators.mockResolvedValue(mockGroups);
    mockGetCreators.mockResolvedValue({
      user1: { first_name: 'Ali', last_name: 'Hassan', username: 'ali_h' },
      user2: { first_name: 'Sara', last_name: 'Khan', username: 'sara_k' },
    });

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status).toBe('success');
    expect(result.current.groups).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(result.current.groups[0]._creatorFullName).toBe('Ali Hassan');
  });

  it('should return empty state when no groups exist', async () => {
    mockGetAllWithCreators.mockResolvedValue([]);
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status).toBe('empty');
    expect(result.current.groups).toHaveLength(0);
  });

  it('should handle error state', async () => {
    mockGetAllWithCreators.mockRejectedValue(new Error('Network error'));
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Network error');
  });

  it('should filter groups by major', async () => {
    mockGetAllWithCreators.mockResolvedValue(mockGroups);
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateFilter('major', 'CS');
    });

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].major).toBe('CS');
  });

  it('should filter groups by status available', async () => {
    mockGetAllWithCreators.mockResolvedValue(mockGroups);
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateFilter('status', 'available');
    });

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].current_members).toBeLessThan(result.current.groups[0].max_members);
  });

  it('should filter groups by search term', async () => {
    mockGetAllWithCreators.mockResolvedValue(mockGroups);
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.onSearchChange('Math');
    });

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(1);
      expect(result.current.groups[0].course_name).toBe('Mathematics');
    });
  });

  it('should clear all filters', async () => {
    mockGetAllWithCreators.mockResolvedValue(mockGroups);
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateFilter('major', 'CS');
    });

    expect(result.current.groups).toHaveLength(1);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.groups).toHaveLength(2);
  });

  it('should reload groups', async () => {
    mockGetAllWithCreators
      .mockResolvedValueOnce(mockGroups)
      .mockResolvedValueOnce([mockGroups[0]]);
    mockGetCreators.mockResolvedValue({});

    const { result } = renderHook(() => useStudyGroups('user123'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.allGroups).toHaveLength(2);

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.allGroups).toHaveLength(1));
  });
});
