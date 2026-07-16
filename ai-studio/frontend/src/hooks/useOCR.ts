import { useState, useEffect, useCallback, useRef } from 'react'
import type { JobStatus } from '../types'
import { getJobStatus } from '../services/api'

export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const jobIdRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const pollStatusRef = useRef<(() => void) | null>(null)

  const clearPolling = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const pollStatus = useCallback(async () => {
    const currentJobId = jobIdRef.current
    if (!currentJobId) return

    abortControllerRef.current = new AbortController()

    try {
      const data = await getJobStatus(currentJobId, abortControllerRef.current.signal)
      setStatus(data)
      setError(null)

      if (data.status === 'queued' || data.status === 'processing') {
        timeoutRef.current = window.setTimeout(() => pollStatusRef.current?.(), 2000)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError('فشل في جلب حالة المهمة')
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    pollStatusRef.current = pollStatus
  })

  useEffect(() => {
    if (jobId) {
      jobIdRef.current = jobId
      clearPolling()
      setIsLoading(true)
      setStatus(null)
      setError(null)
      pollStatusRef.current?.()
    }

    return clearPolling
  }, [jobId, clearPolling])

  return { status, isLoading, error, refetch: pollStatus }
}
