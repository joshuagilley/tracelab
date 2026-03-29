import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSectionConcepts } from '@/features/sections/api'
import {
  fetchLabConceptProgress,
  TRACELAB_CONCEPT_PROGRESS_EVENT,
} from '@/features/concepts/conceptProgressApi'
import { completedSlugsForLab } from '@/features/concepts/conceptSectionExpectations'
import { useAuth } from '@/contexts/auth'
import { useLab, type LabId } from '@/contexts/lab'
import type { Concept } from '@/types/concept'

export interface LabTotals {
  completed: number
  total: number
}

interface LabCurriculumProgressValue {
  concepts: Concept[]
  progressBySlug: Record<string, string[]>
  completedSlugs: ReadonlySet<string>
  labTotals: LabTotals
  reloadProgress: () => Promise<void>
}

const LabCurriculumProgressContext = createContext<LabCurriculumProgressValue | null>(null)

export function LabCurriculumProgressProvider({ children }: { children: ReactNode }) {
  const { labId } = useLab()
  const { user } = useAuth()
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [progressBySlug, setProgressBySlug] = useState<Record<string, string[]>>({})

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
    if (!user) {
      setProgressBySlug({})
      return
    }
    try {
      setProgressBySlug(await fetchLabConceptProgress(labId))
    } catch {
      setProgressBySlug({})
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
    window.addEventListener(TRACELAB_CONCEPT_PROGRESS_EVENT, onUpdate)
    return () => window.removeEventListener(TRACELAB_CONCEPT_PROGRESS_EVENT, onUpdate)
  }, [labId, reloadProgress])

  const completedSlugs = useMemo(
    () => completedSlugsForLab(labId, concepts, progressBySlug),
    [labId, concepts, progressBySlug],
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
      progressBySlug,
      completedSlugs,
      labTotals,
      reloadProgress,
    }),
    [concepts, progressBySlug, completedSlugs, labTotals, reloadProgress],
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
