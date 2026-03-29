import type { LabId } from '@/contexts/lab'
import { API_BASE } from '@/lib/apiBase'

export const TRACELAB_CONCEPT_PROGRESS_EVENT = 'tracelab-concept-progress'

export function dispatchConceptProgressUpdated(labId: LabId): void {
  window.dispatchEvent(
    new CustomEvent(TRACELAB_CONCEPT_PROGRESS_EVENT, { detail: { labId } }),
  )
}

export async function fetchLabConceptProgress(
  lab: LabId,
): Promise<Record<string, string[]>> {
  const q = new URLSearchParams({ lab })
  const res = await fetch(`${API_BASE}/concepts/progress/lab?${q}`, {
    credentials: 'include',
  })
  if (!res.ok) return {}
  const data = (await res.json()) as { bySlug?: Record<string, string[]> }
  return data.bySlug ?? {}
}

export async function fetchConceptProgress(
  lab: LabId,
  slug: string,
): Promise<string[]> {
  const q = new URLSearchParams({ lab, slug })
  const res = await fetch(`${API_BASE}/concepts/progress?${q}`, {
    credentials: 'include',
  })
  if (!res.ok) return []
  const data = (await res.json()) as { completedSections?: string[] }
  return data.completedSections ?? []
}

export async function patchConceptSection(
  lab: LabId,
  slug: string,
  sectionId: string,
  completed: boolean,
): Promise<string[] | null> {
  const res = await fetch(`${API_BASE}/concepts/progress`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab, slug, sectionId, completed }),
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`progress: ${res.status}`)
  const data = (await res.json()) as { completedSections?: string[] }
  return data.completedSections ?? []
}
