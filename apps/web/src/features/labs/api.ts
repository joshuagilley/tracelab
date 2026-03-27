import type { Concept } from '@/types/concept'
import type { LabConceptDetail } from '@/types/labConcept'

const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : '/api'

export async function fetchLabConcepts(labPath: 'design-patterns' | 'data-science'): Promise<Concept[]> {
  const res = await fetch(`${BASE}/labs/${labPath}/concepts`)
  if (!res.ok) throw new Error(`Failed to fetch lab concepts: ${res.status}`)
  return res.json()
}

export async function fetchLabConcept(
  labPath: 'design-patterns' | 'data-science',
  slug: string,
): Promise<LabConceptDetail> {
  const res = await fetch(`${BASE}/labs/${labPath}/concepts/${slug}`)
  if (!res.ok) throw new Error(`Lab concept "${slug}" not found`)
  return res.json()
}

/** Proxied through Go → Python playground (503 if DATASCIENCE_SERVICE_URL unset). */
export async function fetchDatascienceHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE}/datascience/health`)
  if (!res.ok) throw new Error('Datascience offline')
  return res.json()
}
