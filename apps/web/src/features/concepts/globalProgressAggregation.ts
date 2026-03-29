import { LAB_OPTIONS, type LabId } from '@/contexts/lab'
import type { AuthUser } from '@/features/auth/types'
import { fetchLabConceptProgress } from '@/features/concepts/conceptProgressApi'
import {
  CONCEPT_DONE_SECTION_ID,
  labTracksConceptProgress,
} from '@/features/concepts/conceptSectionExpectations'
import { fetchSectionConcepts } from '@/features/sections/api'

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
      let progress: Record<string, string[]> = {}
      try {
        progress = await fetchLabConceptProgress(labId)
      } catch {
        /* ignore */
      }
      for (const c of available) {
        if ((progress[c.slug] ?? []).includes(CONCEPT_DONE_SECTION_ID)) completed += 1
      }
    }
    return { total, completed }
  } catch {
    return { total: 0, completed: 0 }
  }
}

/** All available concepts across every lab, and “done” where that lab persists mark-done. */
export async function fetchGlobalConceptTotals(user: AuthUser | null): Promise<GlobalConceptTotals> {
  const parts = await Promise.all(LAB_OPTIONS.map(({ id }) => totalsForLab(id, user)))
  return parts.reduce(
    (acc, p) => ({ total: acc.total + p.total, completed: acc.completed + p.completed }),
    { total: 0, completed: 0 },
  )
}
