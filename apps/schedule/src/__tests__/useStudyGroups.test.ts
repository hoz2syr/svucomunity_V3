import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStudyGroups } from '../hooks/useStudyGroups'

const mockStudyGroups = [
  {
    id: '1',
    course_code: 'CS101',
    course_name: 'Intro to CS',
    name: 'CS101 Group',
    description: 'Study group for CS101',
    creator_id: 'user1',
    members: ['user1', 'user2'],
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    course_code: 'CS101',
    course_name: 'Intro to CS',
    name: 'CS101 Group 2',
    description: 'Another group',
    creator_id: 'user2',
    members: ['user2'],
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    course_code: 'MATH201',
    course_name: 'Calculus',
    name: 'Math Group',
    description: 'Math study group',
    creator_id: 'user3',
    members: ['user3'],
    created_at: '2024-01-03T00:00:00Z',
  },
]

let mockData: typeof mockStudyGroups | null = mockStudyGroups
let mockError: { message: string } | null = null

vi.mock('../services/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        in: () => ({
          order: () => ({
            range: async () => ({
              data: mockData,
              error: mockError,
            }),
          }),
        }),
        eq: () => ({
          order: () => ({
            range: async () => ({
              data: mockData,
              error: mockError,
            }),
          }),
        }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => {},
      }),
    }),
  },
}))

describe('useStudyGroups', () => {
  beforeEach(() => {
    mockData = mockStudyGroups
    mockError = null
  })

  it('returns empty groups when disabled', () => {
    const { result } = renderHook(() =>
      useStudyGroups({ courseCodes: ['CS101'], enabled: false })
    )
    expect(result.current.availableGroups).toEqual({})
    expect(result.current.fetchError).toBeNull()
  })

  it('returns empty groups when no course codes provided', () => {
    const { result } = renderHook(() =>
      useStudyGroups({ courseCodes: [], enabled: true })
    )
    expect(result.current.availableGroups).toEqual({})
    expect(result.current.fetchError).toBeNull()
  })

  it('fetches and groups study groups by course code', async () => {
    const { result } = renderHook(() =>
      useStudyGroups({ courseCodes: ['CS101', 'MATH201'], enabled: true })
    )

    await waitFor(() => expect(result.current.fetchError).toBeNull())

    expect(result.current.availableGroups['CS101']).toHaveLength(2)
    expect(result.current.availableGroups['MATH201']).toHaveLength(1)
    expect(result.current.availableGroups['CS101'][0].name).toBe('CS101 Group')
    expect(result.current.availableGroups['MATH201'][0].name).toBe('Math Group')
  })

  it('sets fetchError on supabase failure', async () => {
    mockError = { message: 'Database error' }
    const { result } = renderHook(() =>
      useStudyGroups({ courseCodes: ['CS101'], enabled: true })
    )

    await waitFor(() => expect(result.current.fetchError).not.toBeNull())
    expect(result.current.fetchError).toBe('Failed to load study groups. Please try again.')
  })

  it('loadMore appends groups and updates hasMore', async () => {
    const halfData = mockStudyGroups.slice(0, 1)
    let callCount = 0
    mockData = null

    const mockRange = vi.fn(async () => {
      callCount += 1
      if (callCount === 1) {
        return { data: halfData, error: null }
      }
      return { data: [], error: null }
    })

    vi.mocked(require('../services/supabase').supabase).from = () => ({
      select: () => ({
        in: () => ({
          order: () => ({
            range: mockRange,
          }),
        }),
        eq: () => ({
          order: () => ({
            range: mockRange,
          }),
        }),
      }),
    }) as any

    const { result } = renderHook(() =>
      useStudyGroups({ courseCodes: ['CS101'], enabled: true })
    )

    await waitFor(() => expect(result.current.availableGroups['CS101']).toHaveLength(1))
    expect(result.current.hasMore['CS101']).toBe(false)

    mockData = [mockStudyGroups[1]]
    await result.current.loadMore('CS101')

    await waitFor(() => {
      expect(result.current.availableGroups['CS101']).toHaveLength(2)
    })
  })
})
