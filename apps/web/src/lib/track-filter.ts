import type { Concept } from '@/types/concept'

export type CurriculumFilterMode = 'all' | 'published' | 'track'

/** Normalize certification id lists from catalog JSON (`certification_ids` or `certificationIds`). */
export function normalizeConceptCertificationIds(concept: Concept): string[] {
  const raw =
    concept.certificationIds ??
    (concept as { certification_ids?: string[] }).certification_ids
  if (!Array.isArray(raw)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const item of raw) {
    const id = String(item).trim().toLowerCase()
    if (!id || seen.has(id)) continue
    seen.add(id)
    out.push(id)
  }
  return out
}

/**
 * Whether a concept counts toward the selected career certification in Track mode.
 * Uses `Concept.certificationIds` / Mongo `certification_ids` only (not free-form tags).
 * Sentinel `"*"` means every career track (replaces legacy `all_tracks` tag).
 */
export function matchesCareerCertification(concept: Concept, selectedCertificationId: string): boolean {
  if (!selectedCertificationId) return true
  if (selectedCertificationId === 'generalist' || selectedCertificationId === 'expert') return true
  const ids = normalizeConceptCertificationIds(concept)
  if (ids.includes('*')) return true
  return ids.includes(selectedCertificationId.trim().toLowerCase())
}

export function conceptVisibleForMode(
  concept: Concept,
  mode: CurriculumFilterMode,
  selectedCertificationId: string,
): boolean {
  if (mode === 'all') return true
  if (mode === 'published') return concept.status === 'available'
  if (mode === 'track') return matchesCareerCertification(concept, selectedCertificationId)
  return false
}
