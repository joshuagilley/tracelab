import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/labConcept'
import type { LabId } from '@/contexts/lab'
import { API_BASE } from '@/lib/apiBase'

export async function fetchSectionConcepts(section: LabId): Promise<Concept[]> {
  const res = await fetch(`${API_BASE}/sections/${section}/concepts`)
  if (!res.ok) throw new Error(`Failed to fetch concepts: ${res.status}`)
  return res.json()
}

export async function fetchSectionLesson(section: LabId, slug: string): Promise<LabConceptDetail> {
  const res = await fetch(`${API_BASE}/sections/${section}/concepts/${slug}`)
  if (!res.ok) throw new Error(`Lesson "${slug}" not found`)
  return res.json()
}
