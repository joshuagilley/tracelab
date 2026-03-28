import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/labConcept'
import { API_BASE } from '@/lib/apiBase'

export async function fetchLabConcepts(labPath: 'design-patterns' | 'data-science'): Promise<Concept[]> {
  const res = await fetch(`${API_BASE}/labs/${labPath}/concepts`)
  if (!res.ok) throw new Error(`Failed to fetch lab concepts: ${res.status}`)
  return res.json()
}

export async function fetchLabConcept(
  labPath: 'design-patterns' | 'data-science',
  slug: string,
): Promise<LabConceptDetail> {
  const res = await fetch(`${API_BASE}/labs/${labPath}/concepts/${slug}`)
  if (!res.ok) throw new Error(`Lab concept "${slug}" not found`)
  return res.json()
}
