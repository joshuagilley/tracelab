import type { LabId } from '@/contexts/lab'

/** Stored in Mongo `completed_sections` when the learner marks the whole concept done. */
export const CONCEPT_DONE_SECTION_ID = 'concept' as const

const LABS_WITH_WHOLE_CONCEPT_PROGRESS = new Set<LabId>([
  'system-design',
  'api-design',
  'design-patterns',
  'data-science',
  'cloud-architecture',
  'database-design',
  'low-level-systems',
])

/** Labs where the concept detail page supports mark-done (sidebar uses the same rule). */
export function labTracksConceptProgress(labId: LabId): boolean {
  return LABS_WITH_WHOLE_CONCEPT_PROGRESS.has(labId)
}

/** Sidebar: slugs marked complete for this lab (single `concept` flag per slug). */
export function completedSlugsForLab(
  labId: LabId,
  concepts: { slug: string; status: string }[],
  progressBySlug: Record<string, string[]>,
): Set<string> {
  if (!labTracksConceptProgress(labId)) return new Set()
  const done = new Set<string>()
  for (const c of concepts) {
    if (c.status !== 'available') continue
    const got = progressBySlug[c.slug] ?? []
    if (got.includes(CONCEPT_DONE_SECTION_ID)) done.add(c.slug)
  }
  return done
}
