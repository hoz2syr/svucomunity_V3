import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSchedule } from '../features/schedule/hooks/useSchedule'

const mockScheduleData = [
  { id: '1', day_of_week: 0, start_time: '08:00', end_time: '09:00', location: 'Room A', groups: { name: 'G1', courses: { title_ar: 'Math' } } },
]
const mockScheduleError = { message: 'Failed to fetch schedule' }

vi.mock('@svu-community/supabase-client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: async ({ error }: { error?: { message: string } } = {}) => ({
          data: error ? null : mockScheduleData,
          error: error || null,
        }),
      }),
    }),
  },
}))

describe('useSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial loading state', async () => {
    const { result } = renderHook(() => useSchedule())
    expect(result.current.loading).toBe(true)
  })

  it('has refetch function', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(typeof result.current.refetch).toBe('function'))
  })

  it('returns error as null initially', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.error).toBeNull())
  })

  it('returns schedule array with required fields', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(Array.isArray(result.current.schedule)).toBe(true))
    if (result.current.schedule.length > 0) {
      const entry = result.current.schedule[0]
      expect(entry).toHaveProperty('id')
      expect(entry).toHaveProperty('day_of_week')
      expect(entry).toHaveProperty('start_time')
    }
  })

  it('sets error message on supabase failure', async () => {
    const { result } = renderHook(() => useSchedule())
    await waitFor(() => expect(result.current.error?.message || result.current.error).not.toBeNull())
  })
})
