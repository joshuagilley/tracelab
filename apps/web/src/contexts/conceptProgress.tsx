import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { LabId } from '@/contexts/lab'
import { useAuth } from '@/contexts/auth'
import { useConceptCompletionState } from '@/contexts/conceptProgressHooks'
import type { CompletedStatus } from '@/features/learning/api/completed-api'

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
  const { status, loaded, setCompleted, setStatus } = useConceptCompletionState(labId, conceptSlug, user)

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
    [status.completed, completedAt, user, loaded, setCompleted, setStatus],
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
