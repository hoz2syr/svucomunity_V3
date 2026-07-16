import { useCallback, useEffect, useRef } from 'react'
import { saveEditedMarkdown } from '../services/api'

export function useAutoSave(jobId: string | null, editedMarkdown: string | null) {
  const saveTimerRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const clearTimer = useCallback(() => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!jobId || editedMarkdown === null) return

    clearTimer()

    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    saveTimerRef.current = window.setTimeout(async () => {
      try {
        await saveEditedMarkdown(jobId, editedMarkdown, signal)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        console.error('Auto-save failed:', err)
      }
    }, 1500)

    return () => {
      clearTimer()
    }
  }, [jobId, editedMarkdown, clearTimer])

  return { clearTimer }
}
