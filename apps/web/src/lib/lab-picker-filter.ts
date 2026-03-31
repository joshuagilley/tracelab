import type { LabGroup, LabId } from '@/contexts/lab'
import { getCatalogConcepts } from '@/features/curriculum/lesson-catalog'

export function labHasPublishedConcepts(labId: LabId): boolean {
  return getCatalogConcepts(labId).some(c => c.status === 'available')
}

/** Drop labs with no `available` catalog entries; remove empty group headings. */
export function filterLabGroupsForPublishedOnly(groups: readonly LabGroup[]): LabGroup[] {
  return groups
    .map(g => ({
      ...g,
      options: g.options.filter(o => labHasPublishedConcepts(o.id)),
    }))
    .filter(g => g.options.length > 0)
}

/** First lab (catalog order) that has at least one published concept, or null if none. */
export function firstPublishedLabId(groups: readonly LabGroup[]): LabId | null {
  const filtered = filterLabGroupsForPublishedOnly(groups)
  const first = filtered[0]?.options[0]
  return first?.id ?? null
}
