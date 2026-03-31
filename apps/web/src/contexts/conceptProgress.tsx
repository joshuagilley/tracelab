import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { LabId } from '@/contexts/lab'
import { useAuth } from '@/contexts/auth'
import {
  dispatchCompletedUpdated,
  fetchConceptCompleted,
  putConceptCompleted,
  type CompletedStatus,
} from '@/features/learning/api/completed-api'

interface ConceptProgressContextValue {
  conceptFullyDone: boolean
  completedAt: Date | null
  completedLanguages: string[]
  canPersist: boolean
  loaded: boolean
  setConceptDone: (completed: boolean) => Promise<void>
  applyCompletionStatus: (next: CompletedStatus) => void
}

const ConceptProgressContext = createContext<ConceptProgressContextValue | null>(null)

export function ConceptProgressProvider({
  labId,
  conceptSlug,
  children,
}: {
  labId: LabId
  conceptSlug: string
  children: ReactNode
}) {
  const { user } = useAuth()
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
      // Optimistic update
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

  const completedAt = useMemo(
    () => (status.completedAt ? new Date(status.completedAt) : null),
    [status.completedAt],
  )

  const value = useMemo<ConceptProgressContextValue>(
    () => ({
      conceptFullyDone: status.completed,
      completedAt,
      completedLanguages: status.languages ?? [],
      canPersist: !!user,
      loaded,
      setConceptDone: setCompleted,
      applyCompletionStatus: setStatus,
    }),
    [status.completed, completedAt, user, loaded, setCompleted],
  )

  return (
    <ConceptProgressContext.Provider value={value}>{children}</ConceptProgressContext.Provider>
  )
}

export function useConceptProgress(): ConceptProgressContextValue {
  const ctx = useContext(ConceptProgressContext)
  if (!ctx) {
    throw new Error('useConceptProgress must be used within ConceptProgressProvider')
  }
  return ctx
}
