import type { Concept } from '@/types/concept'

// In local dev VITE_API_BASE is empty and Vite proxies /api → localhost:8080.
// In production the Dockerfile bakes in the Cloud Run API service URL.
const BASE = import.meta.env.VITE_API_BASE
  ? `${import.meta.env.VITE_API_BASE}/api`
  : '/api'

export async function fetchConcepts(): Promise<Concept[]> {
  const res = await fetch(`${BASE}/concepts`)
  if (!res.ok) throw new Error(`Failed to fetch concepts: ${res.status}`)
  return res.json()
}

export async function fetchConcept(slug: string): Promise<Concept> {
  const res = await fetch(`${BASE}/concepts/${slug}`)
  if (!res.ok) throw new Error(`Concept "${slug}" not found`)
  return res.json()
}
