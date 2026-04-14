import { useCallback, useEffect, useRef, useState } from 'react'
import type { LabId } from '@/contexts/lab'
import type { AuthUser } from '@/lib/auth/types'
import {
  dispatchCompletedUpdated,
  fetchConceptCompleted,
  putConceptCompleted,
  type CompletedStatus,
} from '@/features/learning/api/completed-api'

export function useConceptCompletionState(labId: LabId, conceptSlug: string, user: AuthUser | null) {
  const [status, setStatus] = useState<CompletedStatus>({ completed: false, completedAt: null })
  const [loaded, setLoaded] = useState(false)
  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    void (async () => {
      const s = await fetchConceptCompleted(labId, conceptSlug)
      if (!cancelled) {
        setStatus(s)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [labId, conceptSlug, user?.id])

  const setCompleted = useCallback(
    async (completed: boolean) => {
      if (!user) return
      const prev = statusRef.current
      setStatus({ completed, completedAt: completed ? new Date().toISOString() : null })
      try {
        const next = await putConceptCompleted(labId, conceptSlug, completed)
        if (next == null) {
          setStatus(prev)
          return
        }
        setStatus(next)
        dispatchCompletedUpdated(labId)
      } catch {
        setStatus(prev)
      }
    },
    [user, labId, conceptSlug],
  )

  return { status, loaded, setCompleted, setStatus }
}
