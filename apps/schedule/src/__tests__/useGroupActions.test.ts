import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGroupActions } from '../hooks/useGroupActions'

const mockSupabaseUpdate = vi.fn(async () => ({ error: null }))
const mockSupabaseInsert = vi.fn(async () => ({ error: null }))

vi.mock('../services/supabase', () => ({
  supabase: {
    from: () => ({
      update: () => ({ eq: () => mockSupabaseUpdate() }),
      insert: () => mockSupabaseInsert(),
    }),
  },
}))

describe('useGroupActions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseUpdate.mockResolvedValue({ error: null })
    mockSupabaseInsert.mockResolvedValue({ error: null })
  })

  it('returns all action functions and loading flags', () => {
    const { result } = renderHook(() => useGroupActions())
    expect(typeof result.current.joinGroup).toBe('function')
    expect(typeof result.current.leaveGroup).toBe('function')
    expect(typeof result.current.createGroup).toBe('function')
    expect(result.current.isJoining).toBe(false)
    expect(result.current.isAnyLoading).toBe(false)
  })

  it('joinGroup calls onError when supabase returns error', async () => {
    mockSupabaseUpdate.mockResolvedValueOnce({ error: { message: 'DB error' } })
    const onError = vi.fn()
    const { result } = renderHook(() => useGroupActions())
    await act(async () => {
      await result.current.joinGroup({ groupId: 'g1', userId: 'u1', currentMembers: ['u2'], onError })
    })
    expect(onError).toHaveBeenCalled()
  })

  it('joinGroup does not double-join existing member', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useGroupActions())
    await act(async () => {
      await result.current.joinGroup({ groupId: 'g1', userId: 'u1', currentMembers: ['u1'], onError })
    })
    expect(onError).not.toHaveBeenCalled()
    expect(mockSupabaseUpdate).not.toHaveBeenCalled()
  })

  it('joinGroup prevents re-entry under concurrent calls', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useGroupActions())
    await act(async () => {
      await Promise.all([
        result.current.joinGroup({ groupId: 'g1', userId: 'u1', currentMembers: ['u2'], onError }),
        result.current.joinGroup({ groupId: 'g1', userId: 'u1', currentMembers: ['u2'], onError }),
      ])
    })
    expect(mockSupabaseUpdate).toHaveBeenCalledTimes(1)
  })

  it('leaveGroup removes user from members', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useGroupActions())
    await act(async () => {
      await result.current.leaveGroup({ groupId: 'g1', userId: 'u1', currentMembers: ['u1', 'u2'], onError })
    })
    expect(onError).not.toHaveBeenCalled()
    expect(mockSupabaseUpdate).toHaveBeenCalledOnce()
  })

  it('createGroup inserts new group', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useGroupActions())
    await act(async () => {
      await result.current.createGroup({
        course: { code: 'CS101', name: 'CS' },
        userId: 'u1',
        onError,
      })
    })
    expect(onError).not.toHaveBeenCalled()
    expect(mockSupabaseInsert).toHaveBeenCalledOnce()
  })
})
