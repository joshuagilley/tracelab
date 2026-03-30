import { LAB_OPTIONS, type LabId } from '@/contexts/lab'
import type { AuthUser } from '@/lib/auth/types'
import { fetchLabCompleted } from '@/features/concepts/completedApi'
import { labTracksConceptProgress } from '@/features/concepts/conceptSectionExpectations'
import { fetchSectionConcepts } from '@/features/lessons/curriculumApi'

export interface GlobalConceptTotals {
  completed: number
  total: number
}

async function totalsForLab(labId: LabId, user: AuthUser | null): Promise<GlobalConceptTotals> {
  try {
    const concepts = await fetchSectionConcepts(labId)
    const available = concepts.filter(c => c.status === 'available')
    const total = available.length
    let completed = 0
    if (user && labTracksConceptProgress(labId)) {
      try {
        const completedSlugs = new Set(await fetchLabCompleted(labId))
        for (const c of available) {
          if (completedSlugs.has(c.slug)) completed += 1
        }
      } catch {
        /* ignore */
      }
    }
    return { total, completed }
  } catch {
    return { total: 0, completed: 0 }
  }
}

/** All available concepts across every lab, and "done" where that lab persists mark-done. */
export async function fetchGlobalConceptTotals(user: AuthUser | null): Promise<GlobalConceptTotals> {
  const parts = await Promise.all(LAB_OPTIONS.map(({ id }) => totalsForLab(id, user)))
  return parts.reduce(
    (acc, p) => ({ total: acc.total + p.total, completed: acc.completed + p.completed }),
    { total: 0, completed: 0 },
  )
}
