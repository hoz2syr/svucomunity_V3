import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFileUpload } from '../hooks/useFileUpload'

const onSuccess = vi.fn()
const onError = vi.fn()

vi.mock('../services/gemini', () => ({
  extractScheduleFromImage: vi.fn(),
}))

vi.mock('../services/supabase', () => ({
  supabase: {},
}))

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns isUploading false initially', () => {
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))
    expect(result.current.isUploading).toBe(false)
  })

  it('returns early for invalid mime type', async () => {
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))
    await act(async () => {
      result.current.handleFileUpload({
        target: { files: [new File(['x'], 'bad.bin', { type: 'application/octet-stream' })] },
      } as any)
    })
    expect(onError).toHaveBeenCalled()
  })

  it('returns early for oversized file', async () => {
    const oversized = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))
    await act(async () => {
      result.current.handleFileUpload({ target: { files: [oversized] } } as any)
    })
    expect(onError).toHaveBeenCalled()
  })

  it('returns early when no file is selected', async () => {
    const { result } = renderHook(() => useFileUpload(onSuccess, onError))
    await act(async () => {
      result.current.handleFileUpload({ target: { files: undefined } } as any)
    })
    expect(onError).not.toHaveBeenCalled()
  })

  it('calls onSuccess with extraction result for a valid image', async () => {
    const { extractScheduleFromImage } = await import('../services/gemini')
    const fakeResult = { events: [] }
    ;(extractScheduleFromImage as any).mockResolvedValueOnce(fakeResult)

    const bytes = new Uint8Array([0xFF, 0xD8, 0xFF])
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    const file = new File([blob], 'valid.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: bytes.length })

    const { result } = renderHook(() => useFileUpload(onSuccess, onError))
    await act(async () => {
      result.current.handleFileUpload({ target: { files: [file] } } as any)
    })
    expect(onSuccess).toHaveBeenCalledWith(fakeResult)
  })

  it('calls onError when extraction fails', async () => {
    const { extractScheduleFromImage } = await import('../services/gemini')
    ;(extractScheduleFromImage as any).mockRejectedValueOnce(new Error('Gemini failure'))

    const bytes = new Uint8Array([0xFF, 0xD8, 0xFF])
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    const file = new File([blob], 'valid.jpg', { type: 'image/jpeg' })
    Object.defineProperty(file, 'size', { value: bytes.length })

    const { result } = renderHook(() => useFileUpload(onSuccess, onError))
    await act(async () => {
      result.current.handleFileUpload({ target: { files: [file] } } as any)
    })
    expect(onError).toHaveBeenCalledWith('Gemini failure')
  })
})
