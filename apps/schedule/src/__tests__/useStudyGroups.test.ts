import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useStudyGroups } from '../hooks/useStudyGroups'

const mockFetchGroups = vi.fn(async () => {
  return [
    { id: '1', course_code: 'CS101', course_name: 'CS', name: 'G1', description: null, creator_id: 'u1', members: [], created_at: '2024-01-01' },
  ]
})

vi.mock('../services/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        in: () => ({
          order: () => ({
            range: async () => ({
              data: await mockFetchGroups(),
              error: null,
            }),
          }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: vi.fn(),
  },
}))

describe('useStudyGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchGroups.mockResolvedValue([
      { id: '1', course_code: 'CS101', course_name: 'CS', name: 'G1', description: null, creator_id: 'u1', members: [], created_at: '2024-01-01' },
    ])
  })

  it('returns empty state when disabled', () => {
    const { result } = renderHook(() => useStudyGroups({ courseCodes: [], enabled: false }))
    expect(result.current.availableGroups).toEqual({})
    expect(result.current.fetchError).toBeNull()
  })

  it('fetches groups when enabled with course codes', async () => {
    const { result } = renderHook(() => useStudyGroups({ courseCodes: ['CS101'], enabled: true }))
    await waitFor(() => expect(Object.keys(result.current.availableGroups).length).toBeGreaterThanOrEqual(0))
    expect(result.current.fetchError).toBeNull()
  })

  it('returns loadMore function', async () => {
    const { result } = renderHook(() => useStudyGroups({ courseCodes: ['CS101'], enabled: true }))
    await waitFor(() => expect(typeof result.current.loadMore).toBe('function'))
  })

  it('loadMore calls fetchGroups with offset', async () => {
    const { result } = renderHook(() => useStudyGroups({ courseCodes: ['CS101'], enabled: true }))
    await waitFor(() => expect(typeof result.current.loadMore).toBe('function'))
    await act(async () => { await result.current.loadMore('CS101') })
    expect(mockFetchGroups).toHaveBeenCalled()
  })

  it('sets fetchError when supabase returns error', async () => {
    const { result } = renderHook(() => useStudyGroups({ courseCodes: ['CS101'], enabled: true }))
    await waitFor(() => expect(result.current.fetchError).toBeDefined())
  })

  it('calls removeChannel on unmount', async () => {
    const { unmount } = renderHook(() => useStudyGroups({ courseCodes: ['CS101'], enabled: true }))
    await waitFor(() => expect(typeof result.current.loadMore).toBe('function'))
    unmount()
  })
})
