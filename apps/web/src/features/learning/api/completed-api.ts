import type { LabId } from '@/contexts/lab'
import { API_BASE } from '@/lib/api-base'

export const TRACELAB_COMPLETED_EVENT = 'tracelab-completed'

export interface CompletedStatus {
  completed: boolean
  completedAt: string | null // ISO-8601 or null
  languages?: string[]
}

export interface SubmittedFile {
  name: string
  content: string
}

export interface SubmitLabResult {
  passed: boolean
  completed: boolean
  completedAt: string | null
  languages?: string[]
  output: string
}

export interface CompletedEntry {
  slug: string
  languages?: string[]
}

export function dispatchCompletedUpdated(labId: LabId): void {
  window.dispatchEvent(
    new CustomEvent(TRACELAB_COMPLETED_EVENT, { detail: { labId } }),
  )
}

/**
 * Fetches all completed concept slugs for the given lab.
 * Returns an empty array when the user is not signed in or on error.
 */
export async function fetchLabCompleted(lab: LabId): Promise<string[]> {
  const q = new URLSearchParams({ lab })
  const res = await fetch(`${API_BASE}/completed?${q}`, { credentials: 'include' })
  if (!res.ok) return []
  const data = (await res.json()) as { completedSlugs?: string[] }
  return data.completedSlugs ?? []
}

export async function fetchLabCompletedDetails(lab: LabId): Promise<CompletedEntry[]> {
  const q = new URLSearchParams({ lab })
  const res = await fetch(`${API_BASE}/completed?${q}`, { credentials: 'include' })
  if (!res.ok) return []
  const data = (await res.json()) as { completed?: CompletedEntry[] }
  return Array.isArray(data.completed) ? data.completed : []
}

/**
 * Fetches the completion status for one concept.
 * Returns { completed: false, completedAt: null } when not signed in or on error.
 */
export async function fetchConceptCompleted(lab: LabId, slug: string): Promise<CompletedStatus> {
  const q = new URLSearchParams({ lab, slug })
  const res = await fetch(`${API_BASE}/completed?${q}`, { credentials: 'include' })
  if (!res.ok) return { completed: false, completedAt: null }
  return (await res.json()) as CompletedStatus
}

/**
 * Marks or unmarks a concept as complete.
 * Returns the updated status, or null when the user is not signed in (401).
 */
export async function putConceptCompleted(
  lab: LabId,
  slug: string,
  completed: boolean,
): Promise<CompletedStatus | null> {
  const res = await fetch(`${API_BASE}/completed`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab, slug, completed }),
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`completed: ${res.status}`)
  return (await res.json()) as CompletedStatus
}

export async function submitConceptLab(
  lab: LabId,
  slug: string,
  files: SubmittedFile[],
  language?: string,
): Promise<SubmitLabResult | null> {
  const res = await fetch(`${API_BASE}/completed/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab, slug, files, language }),
  })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(`submit: ${res.status}`)
  return (await res.json()) as SubmitLabResult
}
