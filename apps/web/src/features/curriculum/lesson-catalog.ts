import type { Concept } from '@/types/concept'
import type { LabId } from '@/contexts/lab'
import type { LabNavConfig, LessonCatalogRow } from '@/features/curriculum/lab-catalog-types'
import { getCachedLabCatalog } from '@/features/curriculum/catalog-cache'

export type { LabNavConfig, LessonCatalogRow, LabCatalogFile } from '@/features/curriculum/lab-catalog-types'

function rowToConcept(row: LessonCatalogRow): Concept {
  const certificationIds = row.certification_ids ?? row.certificationIds ?? []
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    certificationIds: Array.isArray(certificationIds) ? certificationIds : [],
    status: row.status,
  }
}

export function getCatalogConcepts(section: LabId): Concept[] {
  const file = getCachedLabCatalog(section)
  return (file?.concepts ?? []).map(row => rowToConcept(row))
}

/** Returns sidebar nav configuration (sections, panelPrefix, defaultOpen) for a lab. */
export function getCatalogNavConfig(section: LabId): LabNavConfig | null {
  const file = getCachedLabCatalog(section)
  if (!file) return null
  return {
    panelPrefix:          file.panelPrefix,
    navSections:          file.navSections ?? [],
    defaultOpenSectionIds: file.defaultOpenSectionIds,
    languages:            file.languages,
  }
}

/** Resolve a catalog row by lab + slug (detail fields come from GET /api/catalog/lesson). */
export function getCatalogRow(section: LabId, slug: string): LessonCatalogRow | null {
  const file = getCachedLabCatalog(section)
  if (!file) return null
  return file.concepts.find(c => c.slug === slug) ?? null
}

export function isCatalogLabAllTracks(section: LabId): boolean {
  const file = getCachedLabCatalog(section)
  if (!file) return false
  return Boolean(file.all_tracks)
}
