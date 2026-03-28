import type { Concept } from '@/types/concept'
import { API_BASE } from '@/lib/apiBase'

export async function fetchConcepts(): Promise<Concept[]> {
  const res = await fetch(`${API_BASE}/concepts`)
  if (!res.ok) throw new Error(`Failed to fetch concepts: ${res.status}`)
  return res.json()
}

export async function fetchConcept(slug: string): Promise<Concept> {
  const res = await fetch(`${API_BASE}/concepts/${slug}`)
  if (!res.ok) throw new Error(`Concept "${slug}" not found`)
  return res.json()
}
