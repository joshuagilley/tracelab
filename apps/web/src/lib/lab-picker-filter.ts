import type { LabGroup, LabId } from '@/contexts/lab'
import { getCatalogConcepts, isCatalogLabAllTracks } from '@/features/curriculum/lesson-catalog'
import type { CurriculumFilterMode } from '@/lib/track-filter'
import { conceptVisibleForMode } from '@/lib/track-filter'

export function labHasVisibleConcepts(
  labId: LabId,
  mode: CurriculumFilterMode,
  selectedCertificationId: string,
): boolean {
  if (mode === 'all') {
    return true
  }
  if (mode === 'track' && isCatalogLabAllTracks(labId)) {
    return true
  }
  return getCatalogConcepts(labId).some(c => conceptVisibleForMode(c, mode, selectedCertificationId))
}

/** Drop labs with no visible catalog entries for the current filter mode. */
export function filterLabGroups(
  groups: readonly LabGroup[],
  mode: CurriculumFilterMode,
  selectedCertificationId: string,
): LabGroup[] {
  return groups
    .map(g => ({
      ...g,
      options: g.options.filter(o => labHasVisibleConcepts(o.id, mode, selectedCertificationId)),
    }))
    .filter(g => g.options.length > 0)
}

/** First lab (catalog order) that has at least one visible concept, or null if none. */
export function firstVisibleLabId(
  groups: readonly LabGroup[],
  mode: CurriculumFilterMode,
  selectedCertificationId: string,
): LabId | null {
  const filtered = filterLabGroups(groups, mode, selectedCertificationId)
  const first = filtered[0]?.options[0]
  return first?.id ?? null
}
