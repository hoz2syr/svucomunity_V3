import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'

vi.mock('@svu-community/ui', () => ({
  useAuth: () => ({
    user: { id: '1', email: 't@test.com', display_name: 'Test' },
    isAuthReady: true,
    error: null,
    setError: vi.fn(),
    signInWithGoogle: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('@/hooks/useStudyGroups', () => ({
  useStudyGroups: () => ({
    availableGroups: {},
    fetchError: null,
    hasMore: {},
    isLoadingMore: false,
    loadMore: vi.fn(),
  }),
}))

vi.mock('@/hooks/useGroupActions', () => ({
  useGroupActions: () => ({
    joinGroup: vi.fn(),
    leaveGroup: vi.fn(),
    createGroup: vi.fn(),
    isAnyLoading: false,
    isJoining: false,
    isLeaving: false,
    isCreating: false,
  }),
}))

vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    isUploading: false,
    handleFileUpload: vi.fn(),
  }),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders UniSync footer text', () => {
    render(<App />)
    expect(screen.getByText(/UniSync/)).toBeDefined()
  })

  it('shows Upload and Results tabs when logged in', () => {
    render(<App />)
    expect(screen.getByText('Upload Schedule')).toBeDefined()
    expect(screen.getByText('Matching Groups')).toBeDefined()
  })

  it('calls signInWithGoogle when login clicked', () => {
    const mockSignIn = vi.fn()
    const useAuth = require('@svu-community/ui').useAuth as any
    vi.mocked(useAuth).mockImplementation(() => ({
      user: null,
      isAuthReady: true,
      error: null,
      setError: vi.fn(),
      signInWithGoogle: mockSignIn,
      logout: vi.fn(),
    }))
    render(<App />)
    fireEvent.click(screen.getByText('Sign In'))
    expect(mockSignIn).toHaveBeenCalledOnce()
  })

  it('does not show error banner on initial render', async () => {
    render(<App />)
    const errorText = screen.queryByText(/Error/)
    expect(errorText).toBeNull()
  })
})
