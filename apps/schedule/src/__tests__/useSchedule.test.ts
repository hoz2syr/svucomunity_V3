import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSchedule } from '../features/schedule/hooks/useSchedule'

const mockScheduleData = [
  { id: '1', day_of_week: 0, start_time: '08:00', end_time: '09:00', location: 'Room A', groups: { name: 'G1', courses: { title_ar: 'Math' } } },
]

let mockError: { message: string } | null = null
let mockData: typeof mockScheduleData = []

vi.mock('@svu-community/supabase-client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: async () => ({
          data: mockData,
          error: mockError,
        }),
      }),
    }),
  },
}))

describe('useSchedule', () => {
  beforeEach(() => {
    mockError = null
    mockData = [...mockScheduleData]
  })

  it('returns loading=true initially', () => {
    const { result } = renderHook(() => useSchedule())
    expect(result.current.loading).toBe(true)
  })

  it('returns refetch function', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(typeof result.current.refetch).toBe('function')
  })

  it('returns error as null when fetch succeeds', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeNull()
  })

  it('returns schedule array with required fields', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(Array.isArray(result.current.schedule)).toBe(true)
    if (result.current.schedule.length > 0) {
      expect(result.current.schedule[0]).toHaveProperty('id')
      expect(result.current.schedule[0]).toHaveProperty('day_of_week')
      expect(result.current.schedule[0]).toHaveProperty('start_time')
    }
  })

  it('sets error message on supabase failure', async () => {
    mockError = { message: 'Failed to fetch schedule' }
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).not.toBeNull()
    expect(result.current.error).toBe('Failed to fetch schedule')
  })
})
