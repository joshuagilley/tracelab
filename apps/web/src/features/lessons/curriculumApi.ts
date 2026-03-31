import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/lab-concept'
import type { LabId } from '@/contexts/lab'
import { API_BASE } from '@/lib/api-base'
import { getCatalogConcepts } from '@/features/lessons/lessonCatalog'

/** Concept list for one lab (from cached Mongo-backed catalog). */
export async function fetchSectionConcepts(section: LabId): Promise<Concept[]> {
  return getCatalogConcepts(section)
}

/** Full lesson payload for a concept (catalog row + detail merged by API). */
export async function fetchSectionLesson(section: LabId, slug: string): Promise<LabConceptDetail> {
  const q = new URLSearchParams({ lab: section, slug })
  const res = await fetch(`${API_BASE}/catalog/lesson?${q}`)
  if (res.status === 404) {
    throw new Error(`Lesson "${slug}" not found`)
  }
  if (!res.ok) {
    throw new Error(`Lesson fetch failed: ${res.status}`)
  }
  return (await res.json()) as LabConceptDetail
}
