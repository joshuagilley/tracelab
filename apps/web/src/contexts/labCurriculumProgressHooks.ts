import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchSectionConcepts } from '@/features/curriculum/curriculum-api'
import { fetchLabCompleted, TRACELAB_COMPLETED_EVENT } from '@/features/learning/api/completed-api'
import { labTracksConceptProgress } from '@/features/learning/progress/section-expectations'
import type { AuthUser } from '@/lib/auth/types'
import type { LabId } from '@/contexts/lab'
import type { Concept } from '@/types/concept'

export function useLabSectionConcepts(labId: LabId): Concept[] {
  const [concepts, setConcepts] = useState<Concept[]>([])

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

  return concepts
}

export function useLabCompletedSlugs(labId: LabId, user: AuthUser | null) {
  const [completedSlugsList, setCompletedSlugsList] = useState<string[]>([])

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

  const completedSlugs = useMemo(() => new Set(completedSlugsList), [completedSlugsList])

  return { completedSlugs, reloadProgress }
}
