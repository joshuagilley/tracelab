import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSectionConcepts } from '@/features/curriculum/curriculum-api'
import {
  fetchLabCompleted,
  TRACELAB_COMPLETED_EVENT,
} from '@/features/learning/api/completed-api'
import { labTracksConceptProgress } from '@/features/learning/progress/section-expectations'
import { useAuth } from '@/contexts/auth'
import { useLab, type LabId } from '@/contexts/lab'
import type { Concept } from '@/types/concept'

export interface LabTotals {
  completed: number
  total: number
}

interface LabCurriculumProgressValue {
  concepts: Concept[]
  completedSlugs: ReadonlySet<string>
  labTotals: LabTotals
  reloadProgress: () => Promise<void>
}

const LabCurriculumProgressContext = createContext<LabCurriculumProgressValue | null>(null)

export function LabCurriculumProgressProvider({ children }: { children: ReactNode }) {
  const { labId } = useLab()
  const { user } = useAuth()
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [completedSlugsList, setCompletedSlugsList] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        setConcepts(await fetchSectionConcepts(labId))
      } catch {
        setConcepts([])
      }
    }
    void load()
  }, [labId])

  const reloadProgress = useCallback(async () => {
    if (!user || !labTracksConceptProgress(labId)) {
      setCompletedSlugsList([])
      return
    }
    try {
      setCompletedSlugsList(await fetchLabCompleted(labId))
    } catch {
      setCompletedSlugsList([])
    }
  }, [user, labId])

  useEffect(() => {
    void reloadProgress()
  }, [reloadProgress])

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const ce = e as CustomEvent<{ labId?: LabId }>
      if (ce.detail?.labId === labId) void reloadProgress()
    }
    window.addEventListener(TRACELAB_COMPLETED_EVENT, onUpdate)
    return () => window.removeEventListener(TRACELAB_COMPLETED_EVENT, onUpdate)
  }, [labId, reloadProgress])

  const completedSlugs = useMemo(
    () => new Set(completedSlugsList),
    [completedSlugsList],
  )

  const labTotals = useMemo((): LabTotals => {
    const available = concepts.filter(c => c.status === 'available')
    const total = available.length
    let completed = 0
    for (const c of available) {
      if (completedSlugs.has(c.slug)) completed += 1
    }
    return { completed, total }
  }, [concepts, completedSlugs])

  const value = useMemo(
    () => ({
      concepts,
      completedSlugs,
      labTotals,
      reloadProgress,
    }),
    [concepts, completedSlugs, labTotals, reloadProgress],
  )

  return (
    <LabCurriculumProgressContext.Provider value={value}>
      {children}
    </LabCurriculumProgressContext.Provider>
  )
}

export function useLabCurriculumProgress(): LabCurriculumProgressValue {
  const ctx = useContext(LabCurriculumProgressContext)
  if (!ctx) throw new Error('useLabCurriculumProgress must be used within LabCurriculumProgressProvider')
  return ctx
}
