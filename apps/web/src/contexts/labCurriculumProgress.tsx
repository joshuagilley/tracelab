import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/contexts/auth'
import { useLab } from '@/contexts/lab'
import { useLabCompletedSlugs, useLabSectionConcepts } from '@/contexts/labCurriculumProgressHooks'
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
  const concepts = useLabSectionConcepts(labId)
  const { completedSlugs, reloadProgress } = useLabCompletedSlugs(labId, user)

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
