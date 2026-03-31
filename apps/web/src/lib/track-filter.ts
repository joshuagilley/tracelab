import type { Concept } from '@/types/concept'

export type CurriculumFilterMode = 'all' | 'published' | 'track'

export function matchesTrackTags(concept: Concept, trackTags: readonly string[]): boolean {
  if (trackTags.length === 0) return true
  const conceptTags = concept.tags ?? []
  if (conceptTags.length === 0) return false
  const wanted = new Set(trackTags.map(t => t.trim().toLowerCase()).filter(Boolean))
  if (wanted.size === 0) return true
  for (const tag of conceptTags) {
    if (wanted.has(String(tag).toLowerCase())) return true
  }
  return false
}

export function conceptVisibleForMode(
  concept: Concept,
  mode: CurriculumFilterMode,
  trackTags: readonly string[],
): boolean {
  if (mode === 'all') return true
  if (concept.status !== 'available') return false
  if (mode === 'published') return true
  return matchesTrackTags(concept, trackTags)
}
