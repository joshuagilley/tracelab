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
  dispatchConceptProgressUpdated,
  fetchConceptProgress,
  patchConceptSection,
} from '@/features/concepts/conceptProgressApi'
import { CONCEPT_DONE_SECTION_ID } from '@/features/concepts/conceptSectionExpectations'

interface ConceptProgressContextValue {
  conceptFullyDone: boolean
  canPersist: boolean
  loaded: boolean
  toggleConceptDone: () => Promise<void>
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
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const sectionsRef = useRef(completedSections)
  sectionsRef.current = completedSections

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    void (async () => {
      const list = await fetchConceptProgress(labId, conceptSlug)
      if (!cancelled) {
        setCompletedSections(list)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [labId, conceptSlug, user?.id])

  const setConceptFlag = useCallback(
    async (completed: boolean) => {
      if (!user) return
      const prev = sectionsRef.current
      setCompletedSections(() => (completed ? [CONCEPT_DONE_SECTION_ID] : []))
      try {
        const next = await patchConceptSection(
          labId,
          conceptSlug,
          CONCEPT_DONE_SECTION_ID,
          completed,
        )
        if (next == null) {
          setCompletedSections(prev)
          return
        }
        setCompletedSections(next)
        dispatchConceptProgressUpdated(labId)
      } catch {
        setCompletedSections(prev)
      }
    },
    [user, labId, conceptSlug],
  )

  const conceptFullyDone = useMemo(
    () => completedSections.includes(CONCEPT_DONE_SECTION_ID),
    [completedSections],
  )

  const toggleConceptDone = useCallback(async () => {
    await setConceptFlag(!conceptFullyDone)
  }, [conceptFullyDone, setConceptFlag])

  const value = useMemo<ConceptProgressContextValue>(
    () => ({
      conceptFullyDone,
      canPersist: !!user,
      loaded,
      toggleConceptDone,
    }),
    [conceptFullyDone, user, loaded, toggleConceptDone],
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
